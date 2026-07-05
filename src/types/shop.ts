export type ProductCategory = 'MIEL' | 'PRODUIT_NATUREL' | 'CAFE';

export interface ShopProduct {
    id: string;
    name: string;
    description: string;
    price: number;
    category: ProductCategory;
    image_url?: string;
    payment_link?: string;
    in_stock: boolean;
    created_at: string;
}
