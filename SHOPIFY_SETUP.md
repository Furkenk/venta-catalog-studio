# Venta Catalog Studio — Shopify Integration

## Purpose
The Catalog Studio will read real Shopify collections, products, images, variants and product metafields without giving the browser direct access to Shopify credentials.

## Required architecture
Browser -> Vercel server endpoint -> Shopify Admin GraphQL API

The Shopify credential must remain server-side in Vercel Environment Variables and must never be committed to GitHub or exposed to the browser.

## Initial data model
- Collections: id, title, handle, product count
- Products: id, title, handle, vendor, product type, tags
- Images: URL, alt text, dimensions
- Variants: id, SKU, price, selected options
- Metafields: namespace, key, value, type

## Catalog behavior
A collection can be selected as the product source. Products can then be individually added/removed from a page, or all products can be distributed automatically across pages according to the selected products-per-page value.

Example: 72 products / 8 per page = 9 product pages.

## Security
Do not put Shopify client secrets or access tokens in frontend JavaScript, GitHub, or public configuration. Use Vercel server-side environment variables and the Shopify-supported authentication flow for the store/application setup.

## Next connection step
Create the Shopify app in Dev Dashboard, configure the required read scopes, install it on the Venta store, then add the resulting credentials to Vercel Environment Variables. The code can then be connected to the existing Catalog Studio UI.
