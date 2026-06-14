export const getProductImages = (product: any): string[] => {
  if (!Array.isArray(product?.images)) return [];
  return product.images.flatMap((item: any) => {
    if (Array.isArray(item?.images)) return item.images.filter(Boolean);
    if (item?.image) return [item.image];
    return [];
  });
};
