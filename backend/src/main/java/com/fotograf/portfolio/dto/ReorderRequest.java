package com.fotograf.portfolio.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record ReorderRequest(
        @NotNull List<Long> orderedIds
) {
}
