package com.property.app2.stats;

import com.property.app2.dataset.DatasetLoader;
import com.property.app2.dataset.Property;
import java.util.DoubleSummaryStatistics;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

/**
 * 聚合统计服务：基于内存数据集计算总览/分段统计。
 * 结果按方法参数缓存（Caffeine，TTL 10min）——数据集静态，缓存安全。
 */
@Service
public class StatsService {

    private final DatasetLoader dataset;

    public StatsService(DatasetLoader dataset) {
        this.dataset = dataset;
    }

    /** 总览统计。 */
    @Cacheable("overview")
    public OverviewStats overview() {
        List<Property> all = dataset.all();
        DoubleSummaryStatistics priceStats =
                all.stream().mapToDouble(Property::price).summaryStatistics();
        double median = median(all.stream().map(Property::price).sorted().toList());
        return new OverviewStats(
                all.size(),
                round(priceStats.getAverage()),
                (long) priceStats.getMin(),
                (long) priceStats.getMax(),
                round(median),
                round(all.stream().mapToInt(Property::squareFootage).average().orElse(0)),
                round(all.stream().mapToDouble(Property::schoolRating).average().orElse(0))
        );
    }

    /** 按维度分段聚合：每段的样本数/均价/平均面积。段按键的自然序排列。 */
    @Cacheable("segments")
    public List<SegmentStat> segments(SegmentDimension by) {
        Map<String, List<Property>> groups = dataset.all().stream()
                .collect(Collectors.groupingBy(by::segmentOf, TreeMap::new, Collectors.toList()));
        return groups.entrySet().stream()
                .map(e -> new SegmentStat(
                        e.getKey(),
                        e.getValue().size(),
                        round(e.getValue().stream().mapToDouble(Property::price).average().orElse(0)),
                        round(e.getValue().stream().mapToInt(Property::squareFootage).average().orElse(0))
                ))
                .toList();
    }

    private static double median(List<Long> sorted) {
        int n = sorted.size();
        if (n == 0) return 0;
        if (n % 2 == 1) return sorted.get(n / 2);
        return (sorted.get(n / 2 - 1) + sorted.get(n / 2)) / 2.0;
    }

    private static double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    public record OverviewStats(
            long count,
            double avgPrice,
            long minPrice,
            long maxPrice,
            double medianPrice,
            double avgSquareFootage,
            double avgSchoolRating
    ) {
    }

    public record SegmentStat(
            String segment,
            long count,
            double avgPrice,
            double avgSquareFootage
    ) {
    }
}
