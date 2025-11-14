/**
 * Ordena uma lista alfabeticamente por um campo específico
 * @param {Array} list - Lista a ser ordenada
 * @param {string} field - Campo a ser usado para ordenação (ex: 'name', 'fullname')
 * @returns {Array} - Lista ordenada
 */
export function sortAlphabetically(list, field = 'name') {
  return [...list].sort((a, b) => {
    const valueA = (a[field] || '').toLowerCase().trim()
    const valueB = (b[field] || '').toLowerCase().trim()
    return valueA.localeCompare(valueB, 'pt-BR')
  })
}

