import { holding } from '../models/responses'

export const cutText = (text: string, q=20) => {
  if (text.length > q) {
    return text.substring(0, q) + "...";
  }
  return text;
}

export function calculateProfitLossPercentage(holding: holding) {
  if (Number(holding.quantity) === 0) {
    const costBasis = Number(holding.total_buy_spent) / Number(holding.total_buy);
    const profitLoss = Number(holding.avg_price) + Number(holding.all_time_profit_hold) - costBasis;
    return parseFloat((profitLoss / costBasis * 100).toFixed(2));

  } if (Number(holding.quantity) < 0) {
    return 0
  } else {
    const costBasis = Number(holding.avg_price);
    const currentValue = Number(holding.current_price);
    const profitLoss = currentValue - costBasis;
    return parseFloat((profitLoss / costBasis * 100).toFixed(2));
  }
}

export function calculateVariation1d(holding: holding) {
  return parseFloat(((Number(holding.current_price) - Number(holding.previous_close)) / Number(holding.previous_close) * 100).toFixed(2));
}

export function calculateProfitInDollars(holding: holding) {
  let valorActual = Number(holding.current_price) * Number(holding.quantity);
  let costoTotal = Number(holding.total_buy_spent);
  let valorVentas = Number(holding.total_sell_value);
  return parseFloat((valorActual - (costoTotal - valorVentas)).toFixed(2));
}

export function calculateProfitLossDollars(holding: holding, profit: number) {
  if (Number(holding.all_time_profit_hold) !== 0) {
    return parseFloat(profit.toFixed(2));
  }if (Number(holding.quantity) < 0) {
    return Number(holding.total_buy_spent) - Number(holding.total_sell_value)
  } else {
    let cocoro = (Number(holding.current_price) * Number(holding.quantity)) - (Number(holding.avg_price) * Number(holding.quantity) + (Number(holding.all_time_profit_hold) / Number(holding.total_buy))) + Number(holding.all_time_profit_hold);
    return parseFloat(cocoro.toFixed(2));
  }
}

export function determineChangeType(profitLossPercentage: number, profitLossDollars: number) {
  if (profitLossPercentage < 0 || profitLossDollars < 0) {
    return 'negative';
  } else {
    return 'positive';
  }
}

export function adjustNegativeValues(value: number) {
  return value < 0 ? value * -1 : value;
}

 // Función para verificar si la hora UTC está dentro del rango deseado (12pm - 21pm) y es un día de semana (de lunes a viernes)
 export const isStockMarketLive = () => {
  const currentUTCHour = new Date().getUTCHours();
  const currentUTCDay = new Date().getUTCDay(); // 0: Domingo, 1: Lunes, ..., 6: Sábado
  return currentUTCDay >= 1 && currentUTCDay <= 5 && currentUTCHour >= 12 && currentUTCHour < 21;
}

