package com.property.app2.dataset;

import jakarta.annotation.PostConstruct;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

/**
 * 内存数据集：启动时把静态 CSV（50 行）加载为 List&lt;Property&gt;。
 * 数据集只读，因此无需数据库；注意处理文件开头的 BOM。
 */
@Component
public class DatasetLoader {

    private static final String RESOURCE_PATH = "data/house-price-dataset.csv";

    private List<Property> properties;

    @PostConstruct
    void load() throws IOException {
        var resource = new ClassPathResource(RESOURCE_PATH);
        try (var reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
            String header = reader.readLine();
            if (header == null) {
                throw new IllegalStateException("数据集为空: " + RESOURCE_PATH);
            }
            // CSV 第一列名可能带 BOM（﻿），解析行时按位置取值即可，这里只校验非空
            this.properties = reader.lines()
                    .filter(line -> !line.isBlank())
                    .map(DatasetLoader::parseRow)
                    .toList();
        }
    }

    private static Property parseRow(String line) {
        // 首行数据可能残留 BOM 于第一个字段
        String[] cols = line.replace("﻿", "").split(",");
        if (cols.length != 9) {
            throw new IllegalStateException("数据集行格式非法（期望 9 列）: " + line);
        }
        return new Property(
                Long.parseLong(cols[0].trim()),
                Integer.parseInt(cols[1].trim()),
                Integer.parseInt(cols[2].trim()),
                Double.parseDouble(cols[3].trim()),
                Integer.parseInt(cols[4].trim()),
                Long.parseLong(cols[5].trim()),
                Double.parseDouble(cols[6].trim()),
                Double.parseDouble(cols[7].trim()),
                Long.parseLong(cols[8].trim())
        );
    }

    /** 全量数据（不可变视图，50 行规模无需拷贝防御）。 */
    public List<Property> all() {
        return properties;
    }
}
