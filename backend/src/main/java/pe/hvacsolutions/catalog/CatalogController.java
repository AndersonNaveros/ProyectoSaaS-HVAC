package pe.hvacsolutions.catalog;

import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/catalog")
public class CatalogController {
    private final CatalogRepository repository;
    public CatalogController(CatalogRepository repository) { this.repository = repository; }
    public record CatalogResponse(Long id, ItemType type, String name, String sku, String summary, String category) {}

    @GetMapping
    public List<CatalogResponse> catalog() {
        return repository.findByActiveTrueOrderByIdAsc().stream()
          .map(item -> new CatalogResponse(item.getId(), item.getType(), item.getName(), item.getSku(), item.getSummary(), item.getCategory()))
          .toList();
    }
}
