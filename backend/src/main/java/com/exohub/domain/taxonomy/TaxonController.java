package com.exohub.domain.taxonomy;

import com.exohub.common.ApiResponse;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/taxa")
public class TaxonController {

    private final TaxonRepository taxonRepository;

    public TaxonController(TaxonRepository taxonRepository) {
        this.taxonRepository = taxonRepository;
    }

    @GetMapping("/search")
    public ApiResponse<List<Taxon>> search(@RequestParam(defaultValue = "") String q) {
        String keyword = q.trim();
        if (keyword.isEmpty()) {
            return ApiResponse.ok(List.of());
        }
        List<Taxon> results = taxonRepository
                .findTop20ByScientificNameContainingIgnoreCaseOrKoreanNameContainingIgnoreCaseOrTradeNameContainingIgnoreCase(
                        keyword, keyword, keyword
                );
        return ApiResponse.ok(results);
    }
}
