package com.exohub.domain.pricing;

import com.exohub.common.ApiResponse;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/pricing")
public class PricingController {

    @GetMapping("/status")
    public ApiResponse> status() {
        return ApiResponse.ok(Map.of(
                "module", "pricing",
                "aiValuationEnabled", false,
                "aiForecastEnabled", false,
                "status", "READY_FOR_MODEL_INTEGRATION"
        ));
    }
}