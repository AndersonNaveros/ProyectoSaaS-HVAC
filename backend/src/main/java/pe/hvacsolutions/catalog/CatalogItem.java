package pe.hvacsolutions.catalog;

import jakarta.persistence.*;

@Entity
@Table(name = "catalog_items")
public class CatalogItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private ItemType type;
    @Column(nullable = false)
    private String name;
    private String sku;
    @Column(nullable = false)
    private String summary;
    @Column(nullable = false)
    private String category;
    @Column(nullable = false)
    private boolean active;
    @Column(name="company_id", nullable=false)
    private Long companyId;
    @Column(name="brand_name") private String brandName;

    protected CatalogItem() {}
    public Long getId() { return id; }
    public ItemType getType() { return type; }
    public String getName() { return name; }
    public String getSku() { return sku; }
    public String getSummary() { return summary; }
    public String getCategory() { return category; }
    public boolean isActive() { return active; }
    public Long getCompanyId() { return companyId; }
    public String getBrandName() { return brandName; }
}
