// Ejercicio Kotlin · Parte 4 del TODO.md
//
// Alcance: solo lo visto en la semana 7 (val/var, funciones, clases, tipos que admiten null,
// `?.`, `?:`, if/when, plantillas de cadena). No exige proyecto Android.
// Cómo ejecutarlo: pegue el archivo en https://play.kotlinlang.org o compílelo con `kotlinc`.

// Umbral de «pocas unidades» (el mismo LOW_STOCK_THRESHOLD de la app).
const val LOW_STOCK_THRESHOLD = 5

// Clase Product: `val` para lo que no cambia (id, name, category) y `var` para lo que sí
// cambia en un catálogo (price y stock). `stock` es Int? porque puede no conocerse (null).
class Product(
    val id: Int,
    val name: String,
    var price: Double,
    val category: String,
    var stock: Int?
)

// null → "Sin dato" · 0 → "Agotado" · menos de 5 → "Pocas unidades" · otro caso → "Disponible".
fun stockLabel(stock: Int?): String {
    if (stock == null) return "Sin dato"
    return when {
        stock <= 0 -> "Agotado"
        stock < LOW_STOCK_THRESHOLD -> "Pocas unidades"
        else -> "Disponible"
    }
}

// Devuelve el precio con el descuento aplicado (p. ej. 10000.0 con 15 % → 8500.0).
fun applyDiscount(price: Double, percent: Int): Double {
    return price - (price * percent / 100.0)
}

fun main() {
    val products = listOf(
        Product(1, "Agua mineral 600 ml", 1800.0, "Bebidas", 120),
        Product(5, "Galletas de avena x6", 2700.0, "Snacks", 0),
        Product(9, "Escoba de cerdas suaves", 9500.0, "Hogar", null)
    )

    for (product in products) {
        val discounted = applyDiscount(product.price, 10)
        val stockText = product.stock?.toString() ?: "sin dato"
        println("${product.name} (${product.category}) | stock: $stockText | ${stockLabel(product.stock)} | precio con 10 %: $discounted")
    }
}
