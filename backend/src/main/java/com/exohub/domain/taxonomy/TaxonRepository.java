package com.exohub.domain.taxonomy;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaxonRepository extends JpaRepository<Taxon, UUID> {
    List<Taxon> findTop20ByScientificNameContainingIgnoreCaseOrKoreanNameContainingIgnoreCaseOrTradeNameContainingIgnoreCase(
            String scientificName,
            String koreanName,
            String tradeName
    );
}
