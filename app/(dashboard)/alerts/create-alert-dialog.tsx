const {
  data: rateQuote,
  isFetching: isLoadingRate,
} = useQuery({
  queryKey: ["alert-rate", baseCurrency, quoteCurrency],
  queryFn: () => fetchExchangeRate(baseCurrency, quoteCurrency),
  enabled: Boolean(open && baseCurrency && quoteCurrency && baseCurrency !== quoteCurrency),
});