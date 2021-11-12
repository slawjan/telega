export const getPeriodKeys = (period, periods) => {
  const index = periods.indexOf(period)
  const keys = []
  if (index > 2) {
    keys.push({
      text: '<',
      callback_data: '/period left',
    })
  }
  for (let i = index > 1 ? index - 2 : 0; i < index + 3; i++) {
    keys.push({
      text: periods[i],
      callback_data: `/period ${periods[i]}`,
    })
  }
  if(index+3<periods.length){
    keys.push({
      text: '>',
      callback_data: '/period right',
    })
  }

  return keys
}
