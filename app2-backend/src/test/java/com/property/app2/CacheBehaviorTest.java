package com.property.app2;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.property.app2.stats.SegmentDimension;
import com.property.app2.stats.StatsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;

/** 缓存行为测试：相同参数的重复请求只触发一次真实计算。 */
@SpringBootTest
@AutoConfigureMockMvc
class CacheBehaviorTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoSpyBean
    private StatsService statsService;

    @Test
    void repeatedOverviewCallsAreServedFromCache() throws Exception {
        mockMvc.perform(get("/api/stats/overview")).andExpect(status().isOk());
        mockMvc.perform(get("/api/stats/overview")).andExpect(status().isOk());
        // 第二次命中缓存，真实方法只执行一次
        verify(statsService, times(1)).overview();
    }

    @Test
    void repeatedSegmentCallsWithSameDimensionAreCached() throws Exception {
        mockMvc.perform(get("/api/stats/segments").param("by", "decade"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/stats/segments").param("by", "decade"))
                .andExpect(status().isOk());
        verify(statsService, times(1)).segments(SegmentDimension.DECADE);
    }
}
