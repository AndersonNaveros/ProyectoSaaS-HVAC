package pe.hvacsolutions.request;

import java.util.UUID;
import jakarta.persistence.*;
import pe.hvacsolutions.catalog.CatalogItem;
import pe.hvacsolutions.catalog.ItemType;

@Entity
@Table(name = "quotation_request_lines")
public class QuotationRequestLine {
    @Id private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quotation_request_id", nullable = false)
    private QuotationRequest request;
    @Column(name = "catalog_item_id", nullable = false)
    private Long catalogItemId;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemType type;
    @Column(name = "item_name", nullable = false)
    private String itemName;
    private String sku;
    @Column(nullable = false)
    private int quantity;

    protected QuotationRequestLine() {}
    public QuotationRequestLine(CatalogItem item, int quantity) {
        this.id = UUID.randomUUID();
        this.catalogItemId = item.getId();
        this.type = item.getType();
        this.itemName = item.getName();
        this.sku = item.getSku();
        this.quantity = quantity;
    }
    void setRequest(QuotationRequest request) { this.request = request; }
    public ItemType getType() { return type; }
    public String getItemName() { return itemName; }
    public int getQuantity() { return quantity; }
}
