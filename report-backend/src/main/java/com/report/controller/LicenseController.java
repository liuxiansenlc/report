package com.report.controller;

import com.report.common.Result;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/license")
public class LicenseController {

    @GetMapping("/status")
    public Result<Map<String, Object>> status() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("valid", true);
        data.put("status", "ACTIVE");
        data.put("edition", "LOCAL");
        data.put("expireDate", LocalDate.now().plusYears(10).toString());
        data.put("message", "local development license");
        return Result.success(data);
    }
}
