package pe.hvacsolutions.catalog;

import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/catalog")
public class CatalogController {
    private final CatalogRepository repository;
    public CatalogController(CatalogRepository repository) { this.repository = repository; }
    public record CatalogResponse(Long id, ItemType type, String name, String sku, String summary, String category,String brand) {}

    @GetMapping
    public List<CatalogResponse> catalog() {
        return repository.findByCompanyIdAndActiveTrueOrderByIdAsc(1L).stream()
          .map(item -> new CatalogResponse(item.getId(), item.getType(), item.getName(), item.getSku(), item.getSummary(), item.getCategory(),item.getBrandName()))
          .toList();
    }
}
