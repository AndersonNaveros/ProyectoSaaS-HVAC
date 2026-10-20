package pe.hvacsolutions.catalog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CatalogRepository extends JpaRepository<CatalogItem, Long> {
    List<CatalogItem> findByActiveTrueOrderByIdAsc();
}
