import ProductList from '@/components/shared/product/product-list';
import { getLatestProductsByCategory } from '@/lib/actions/product.actions';
import ViewAllProductsButton from '@/components/view-all-products-button';
import DealCountdown from '@/components/deal-countdown';
import Hero from '@/components/hero/hero';
import CustomerReviews from '@/components/home/customer-reviews';
import HomeContactCard from '@/components/home/home-contact-card';
import type { Product } from '@/types';

type RawProduct = {
  subCategory?: unknown;
  salePercent?: unknown;
  saleUntil?: unknown;
  [key: string]: unknown;
};

const normalizeProducts = (products: RawProduct[]): Product[] =>
  products.map((product) => {
    const rawSaleUntil = product.saleUntil;
    const normalizedSaleUntil = rawSaleUntil
      ? new Date(rawSaleUntil as string | number | Date)
      : undefined;

    const rawSalePercent = product.salePercent;
    const normalizedSalePercent =
      rawSalePercent !== null && rawSalePercent !== undefined
        ? Number(rawSalePercent as number | string)
        : undefined;

    return {
      ...product,
      subCategory: (product.subCategory as string | null | undefined) ?? undefined,
      salePercent: normalizedSalePercent,
      saleUntil:
        normalizedSaleUntil && !Number.isNaN(normalizedSaleUntil.getTime())
          ? normalizedSaleUntil.toISOString()
          : undefined,
    } as Product;
  });

const Homepage = async () => {
  // Themed sections: make sure your products use these category names
  const pendantNecklacesRaw = await getLatestProductsByCategory('PENDANT NECKLACES', 24);
  const jewelrySetsRaw = await getLatestProductsByCategory('JEWELRY SETS', 24);
  const braceletsRaw = await getLatestProductsByCategory('BRACELETS', 24);
  const macrameAccessoriesRaw = await getLatestProductsByCategory('MACRAME TRESS AND POUCHES', 24);
  const chokersRaw = await getLatestProductsByCategory('CHOKERS AND OTHER NECKLACES', 24);

  const pendantNecklaces = normalizeProducts(pendantNecklacesRaw);
  const jewelrySets = normalizeProducts(jewelrySetsRaw);
  const bracelets = normalizeProducts(braceletsRaw);
  const macrameAccessories = normalizeProducts(macrameAccessoriesRaw);
  const chokers = normalizeProducts(chokersRaw);

  return (
    <>
      <Hero />

      {/* <ProductList data={latestProducts} title='Newest Arrivals' /> */}

      {/* {featuredProducts.length > 0 && (
        <ProductCarousel data={featuredProducts} />
      )} */}

      {/* Themed collections as simple entry points */}
      {pendantNecklaces.length > 0 && (
        <ProductList data={pendantNecklaces} title='Pendant Necklaces' />
      )}
      {jewelrySets.length > 0 && (
        <ProductList data={jewelrySets} title="Jewelry Sets" />
      )}
      {bracelets.length > 0 && (
        <ProductList data={bracelets} title='Bracelets' />
      )}

      {macrameAccessories.length > 0 && (
        <ProductList data={macrameAccessories} title='Macrame Tress & Pouches' />
      )}


      {chokers.length > 0 && (
        <ProductList data={chokers} title='Chokers & Other Necklaces' />
      )}


      <ViewAllProductsButton />

      {/* Trust & contact */}
      <DealCountdown />
      <CustomerReviews />
      <HomeContactCard />
    </>
  );
};

export default Homepage;
