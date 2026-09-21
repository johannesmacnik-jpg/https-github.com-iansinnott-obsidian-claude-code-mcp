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

// Freitext-Suche (z.B. "Weißwurst"), falls kein Barcode zur Hand ist.
// Liefert mehrere Treffer, da ein Name nicht eindeutig ist wie ein Barcode.
export async function searchProductsByName(query, pageSize = 5) {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=${pageSize}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('network')

  const data = await res.json()
  const products = data.products || []

  return products
    .map((p) => {
      const n = p.nutriments || {}
      const kcal = n['energy-kcal_100g']
      if (kcal == null) return null
      return {
        name: p.product_name || p.generic_name || query,
        kcal100: Math.round(kcal),
        protein100: Math.round(n['proteins_100g'] ?? 0),
        carbs100: Math.round(n['carbohydrates_100g'] ?? 0),
        fat100: Math.round(n['fat_100g'] ?? 0),
      }
    })
    .filter(Boolean)
    .slice(0, pageSize)
}
