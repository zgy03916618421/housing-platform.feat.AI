package com.property.app2;

import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.is;

import com.property.app2.config.AppProperties;
import com.property.app2.model.ModelClient;
import com.property.app2.model.ModelResponseException;
import com.property.app2.model.ModelUnavailableException;
import com.property.app2.whatif.WhatIfController;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/** what-if 端点测试：ModelClient 用 Mockito stub，不起真实 ML 容器。 */
@WebMvcTest(WhatIfController.class)
// 切片测试不处理主类的 @ConfigurationPropertiesScan，需显式注册配置属性 bean（WebConfig 依赖它）
@EnableConfigurationProperties(AppProperties.class)
class WhatIfControllerTest {

    private static final String VALID_ITEM = """
            {
              "square_footage": 1550, "bedrooms": 3, "bathrooms": 2.5,
              "year_built": 1997, "lot_size": 6800,
              "distance_to_city_center": 4.1, "school_rating": 7.6
            }
            """;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ModelClient modelClient;

    @Test
    void validRequestReturnsPredictions() throws Exception {
        when(modelClient.predict(anyList())).thenReturn(List.of(250000.0));
        mockMvc.perform(post("/api/whatif")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[" + VALID_ITEM + "]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.predictions[0]", is(250000.0)));
    }

    @Test
    void modelUnavailableMapsTo503() throws Exception {
        when(modelClient.predict(anyList()))
                .thenThrow(new ModelUnavailableException("ML 模型容器不可达", null));
        mockMvc.perform(post("/api/whatif")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[" + VALID_ITEM + "]"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error.code", is("MODEL_UNAVAILABLE")));
    }

    @Test
    void modelErrorMapsTo502() throws Exception {
        when(modelClient.predict(anyList()))
                .thenThrow(new ModelResponseException(500, "boom"));
        mockMvc.perform(post("/api/whatif")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[" + VALID_ITEM + "]"))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.error.code", is("MODEL_ERROR")));
    }

    @Test
    void outOfRangeFieldRejectedWith400() throws Exception {
        String invalid = VALID_ITEM.replace("\"school_rating\": 7.6", "\"school_rating\": 11");
        mockMvc.perform(post("/api/whatif")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[" + invalid + "]"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("VALIDATION_ERROR")));
    }

    @Test
    void futureYearBuiltRejectedWith400() throws Exception {
        String invalid = VALID_ITEM.replace("\"year_built\": 1997", "\"year_built\": 2100");
        mockMvc.perform(post("/api/whatif")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[" + invalid + "]"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("VALIDATION_ERROR")));
    }

    @Test
    void emptyBatchRejectedWith400() throws Exception {
        mockMvc.perform(post("/api/whatif")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[]"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("VALIDATION_ERROR")));
    }
}
