package com.report.controller;

import com.report.common.Result;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@RestController
@RequestMapping("/ai")
@CrossOrigin(origins = "*")
public class SparkAiController {

    @Value("${ai.spark.enabled:false}")
    private boolean enabled;

    @Value("${ai.spark.url:}")
    private String sparkUrl;

    @Value("${ai.spark.api-key:}")
    private String apiKey;

    // Use Java 11+ HttpClient instead of RestTemplate to avoid WAF 401 / chunked encoding issues
    private static final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @PostMapping("/chat")
    public Result<String> chat(@RequestBody Map<String, Object> requestParams) {
        String userMessage = String.valueOf(requestParams.getOrDefault("message", "你好")).trim();
        if (!enabled) {
            return Result.success(demoReply(userMessage));
        }

        if (sparkUrl == null || sparkUrl.isBlank() || apiKey == null || apiKey.isBlank()) {
            return Result.error(503, "智能助手已启用，但尚未配置有效的模型服务密钥");
        }

        try {
            // Build request body string manually or via a simple map
            String requestBodyStr = "{"
                    + "\"model\":\"spark-x\","
                    + "\"messages\":[{\"role\":\"user\",\"content\":\"" + userMessage.replace("\"", "\\\"").replace("\n", "\\n") + "\"}],"
                    + "\"stream\":false"
                    + "}";

            String targetUrl = sparkUrl;
            if (!targetUrl.endsWith("/chat/completions")) {
                targetUrl = targetUrl + (targetUrl.endsWith("/") ? "" : "/") + "chat/completions";
            }

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(targetUrl))
                    .header("Authorization", "Bearer " + apiKey.trim())
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBodyStr))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                // Return raw response string directly, we can parse it in frontend
                // Actually, our frontend expects JSON with choices array
                String body = response.body();
                // simple substring extraction since we don't have Jackson ObjectMapper here handy
                // better to use ObjectMapper:
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                Map<String, Object> responseMap = mapper.readValue(body, Map.class);
                
                if (responseMap.containsKey("choices")) {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) responseMap.get("choices");
                    if (!choices.isEmpty()) {
                        Map<String, Object> messageObj = (Map<String, Object>) choices.get(0).get("message");
                        if (messageObj != null && messageObj.containsKey("content")) {
                            return Result.success((String) messageObj.get("content"));
                        }
                    }
                }
                return Result.success(body);
            } else {
                return Result.error(response.statusCode(), "调用大模型报错: " + response.body());
            }

        } catch (Exception e) {
            e.printStackTrace();
            return Result.error(500, "调用大模型失败: " + e.getMessage());
        }
    }

    private String demoReply(String message) {
        String normalizedMessage = message.toLowerCase();
        if (normalizedMessage.contains("ph") || message.contains("酸碱")) {
            return "[演示模式] 土壤 pH 需要结合作物适宜范围判断。通常先检测当前 pH，再通过有机肥、石灰或酸性调理材料分阶段调整，并持续复测。";
        }
        if (message.contains("有机质") || message.contains("施肥") || message.contains("肥料")) {
            return "[演示模式] 提升有机质可优先考虑腐熟有机肥、秸秆还田和绿肥轮作，并根据土壤检测结果控制氮磷钾投入，避免过量施肥。";
        }
        if (message.contains("镉") || message.contains("重金属") || message.contains("风险")) {
            return "[演示模式] 重金属风险管理应以检测数据为依据，关注污染等级、作物类型与 pH 条件；高风险地块需要采取阻控措施并咨询专业机构。";
        }
        return "[演示模式] 当前智能助手使用预设答复。您可以询问土壤酸碱度、有机质施肥或重金属风险等耕地改良问题。";
    }
}
