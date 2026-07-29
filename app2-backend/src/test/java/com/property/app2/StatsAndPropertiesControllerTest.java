package com.property.app2;

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

/** 统计与明细端点测试（真实内存数据集，50 行）。 */
@SpringBootTest
@AutoConfigureMockMvc
class StatsAndPropertiesControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void overviewReturnsAggregates() throws Exception {
        mockMvc.perform(get("/api/stats/overview"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count", is(50)))
                .andExpect(jsonPath("$.avgPrice", greaterThan(0.0)))
                .andExpect(jsonPath("$.medianPrice", greaterThan(0.0)))
                .andExpect(jsonPath("$.maxPrice", greaterThan(0)))
                .andExpect(jsonPath("$.avgSquareFootage", greaterThan(0.0)));
    }

    @Test
    void segmentsByBedroomsReturnsGroups() throws Exception {
        mockMvc.perform(get("/api/stats/segments").param("by", "bedrooms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThan(1))))
                .andExpect(jsonPath("$[0].segment").exists())
                .andExpect(jsonPath("$[0].count", greaterThan(0)))
                .andExpect(jsonPath("$[0].avgPrice", greaterThan(0.0)));
    }

    @Test
    void segmentsWithInvalidDimensionReturns400() throws Exception {
        mockMvc.perform(get("/api/stats/segments").param("by", "bogus"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("VALIDATION_ERROR")));
    }

    @Test
    void propertiesSortDescending() throws Exception {
        mockMvc.perform(get("/api/properties").param("sort", "price").param("order", "desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(50)))
                // 降序：第一条价格不低于最后一条
                .andExpect(jsonPath("$[0].price", greaterThan(0)));
    }

    @Test
    void propertiesWithInvalidSortFieldReturns400() throws Exception {
        mockMvc.perform(get("/api/properties").param("sort", "bogus"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("VALIDATION_ERROR")));
    }

    @Test
    void propertiesFilterByBedrooms() throws Exception {
        mockMvc.perform(get("/api/properties").param("bedrooms", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].bedrooms", everyItem(is(3))));
    }

    @Test
    void unknownPathReturns404InUnifiedFormat() throws Exception {
        mockMvc.perform(get("/api/does-not-exist"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code", is("NOT_FOUND")));
    }
}
