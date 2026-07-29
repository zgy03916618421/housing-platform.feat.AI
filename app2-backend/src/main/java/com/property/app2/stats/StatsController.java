package com.property.app2.stats;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** 市场统计端点。 */
@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/overview")
    public StatsService.OverviewStats overview() {
        return statsService.overview();
    }

    @GetMapping("/segments")
    public List<StatsService.SegmentStat> segments(@RequestParam(defaultValue = "bedrooms") String by) {
        // 非法维度由 fromParam 抛 IllegalArgumentException → 400（见 GlobalExceptionHandler）
        return statsService.segments(SegmentDimension.fromParam(by));
    }
}
