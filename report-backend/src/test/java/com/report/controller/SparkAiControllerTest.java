package com.report.controller;

import com.report.common.Result;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class SparkAiControllerTest {

    @Test
    void returnsDemoReplyWhenAiIsDisabled() {
        SparkAiController controller = new SparkAiController();

        Result<String> result = controller.chat(Map.of("message", "如何调整土壤pH？"));

        assertThat(result.getCode()).isEqualTo(200);
        assertThat(result.getData()).startsWith("[演示模式]");
        assertThat(result.getData()).contains("pH");
    }

    @Test
    void refusesRealRequestWhenEnabledWithoutApiKey() {
        SparkAiController controller = new SparkAiController();
        ReflectionTestUtils.setField(controller, "enabled", true);
        ReflectionTestUtils.setField(controller, "sparkUrl", "https://example.invalid/chat/completions");
        ReflectionTestUtils.setField(controller, "apiKey", "");

        Result<String> result = controller.chat(Map.of("message", "你好"));

        assertThat(result.getCode()).isEqualTo(503);
        assertThat(result.getMessage()).contains("密钥");
    }
}
