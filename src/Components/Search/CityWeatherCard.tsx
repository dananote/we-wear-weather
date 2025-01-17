import React, { FC } from 'react';
import CardWeather from './CardWeather';
import { useQuery } from 'react-query';
import useOpenWeatherAPI from 'API/useOpenWeatherAPI';
import { CityWeatherType } from 'types/cityWeatherType';
import useSearchedCities from 'Hooks/useSearchedCites';

interface CityWeatherCardProps {
  cityName: string;
  latLonData: {
    lon: number;
    lat: number;
  };
}

const CityWeatherCard: FC<CityWeatherCardProps> = ({ cityName, latLonData }) => {
  const { getCityWeather } = useOpenWeatherAPI();
  const { data, isLoading, isError } = useQuery(
    ['weatherCity', latLonData], // Query key
    () => getCityWeather(latLonData), // API 요청 함수
    {
      enabled: cityName !== '',
    },
  );

  if (isLoading) {
    return <div>로딩중입니다</div>;
  }

  if (isError) {
    return <div>날씨 데이터를 불러올 수 없습니다</div>;
  }

  return (
    <CardWeather
      temp={data.main.temp}
      max={data.main.temp_max}
      min={data.main.temp_min}
      weather={data.weather[0].description}
      name={cityName}
    />
  );
};

export default CityWeatherCard;
