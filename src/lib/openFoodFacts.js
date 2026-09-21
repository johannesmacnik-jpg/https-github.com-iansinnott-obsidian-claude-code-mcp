// Open Food Facts ist eine freie, offene Lebensmittel-Datenbank
// (https://world.openfoodfacts.org) - kostenlos nutzbar, kein API-Key nötig.
// Werte kommen standardmäßig pro 100g/100ml.

export async function lookupProductByBarcode(barcode) {
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=product_name,nutriments`
  const res = await fetch(url)
  if (!res.ok) throw new Error('network')

  const data = await res.json()
  if (data.status !== 1 || !data.product) return null

  const n = data.product.nutriments || {}
  return {
    name: data.product.product_name || `Produkt ${barcode}`,
    kcal100: Math.round(n['energy-kcal_100g'] ?? 0),
    protein100: Math.round(n['proteins_100g'] ?? 0),
    carbs100: Math.round(n['carbohydrates_100g'] ?? 0),
    fat100: Math.round(n['fat_100g'] ?? 0),
  }
}
