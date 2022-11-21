const oldRegistries = [
]

let entradas
let saidas

const existEntrada = oldRegistries.find((r) => r.type === "entrada")
const existSaida = oldRegistries.find((r) => r.type === "saida")

if(existEntrada){
    entradas = oldRegistries.filter((registry) => registry.type === 'entrada')
        .map((entrada) => entrada.value)
        .reduce((total, entrada) => total += entrada)
}
else{
    entradas = 0.00
}

if(existSaida){
    saidas = oldRegistries.filter((registry) => registry.type === 'saida')
    .map((saida) => saida.value)
    .reduce((total, saida) => total += saida)
}else{
    saidas = 0.00
}

const saldo = entradas - saidas

console.log(saldo)

       