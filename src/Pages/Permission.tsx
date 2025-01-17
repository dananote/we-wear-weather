import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from 'styled-components';
import { useRecoilState } from 'recoil';
import { userCityAtom } from 'Atom/userLocationAtom';
import Button from 'Components/common/Button';
import RejectionModal from 'Components/Permission/RejectionModal';
import location from 'Assets/location.svg';
import cityNameAPI from 'API/cityNameAPI';
import useSearchedCities from 'Hooks/useSearchedCites';
import { CityWeatherType } from 'types/cityWeatherType';

const Permission: FC = () => {
  const [isLocation, setIsLocation] = useState({
    cityName: '',
    latLonData: { lat: 0, lon: 0 },
  });
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useRecoilState(userCityAtom);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showLoading, setShowLoading] = useState<boolean>(true);
  const { addSearchedCity } = useSearchedCities();
  const [geoCompleted, setGeoCompleted] = useState(false);

  async function handleCityName() {
    const res = await cityNameAPI(isLocation.latLonData);
    const resCityName = res.region_1depth_name + ' ' + res.region_2depth_name;
    try {
      setIsLocation((prev) => ({
        ...prev,
        cityName: resCityName,
      }));
      addSearchedCity(resCityName, isLocation.latLonData, true);
    } catch (error) {
      console.log(error);
    }

    setShowLoading(false);
  }

  async function handleGeo(): Promise<void> {
    const getUserLocation = (): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
    };

    try {
      const position: GeolocationPosition = await getUserLocation();
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      setIsLocation((prev) => ({
        ...prev,
        latLonData: {
          lat: lat,
          lon: lon,
        },
      }));
    } catch (error) {
      setShowModal(true);
    }
  }

  useEffect(() => {
    async function fetchData() {
      await handleGeo();
      setGeoCompleted(true);
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (geoCompleted && !userLocation.cityName) {
      handleCityName();
    }
  }, [geoCompleted]);

  function handleNextBtn() {
    if (userLocation && !showModal) {
      navigate('/profile');
      // setUserLocation((prev: CityWeatherType[]) => [isLocation, ...prev]);
    } else {
      alert('필수 위치 권한에 동의 하지 않으셨습니다.');
    }
  }

  return (
    <SLayout>
      <STitleWrap>
        <h1 className='a11y-hidden'>필수 권한 안내</h1>
        <h2>We Wear Weather 이용을 위해 아래 권한을 허용해주세요.</h2>
        <SPermissionInfoWrap>
          <div>
            <img src={location} alt='위치 아이콘' />
          </div>
          <div>
            <h3>위치</h3>
            <p>내 위치는 현재 날씨 정보, 주간 날씨 정보 제공을 위해 필수 정보로 활용됩니다.</p>
          </div>
        </SPermissionInfoWrap>
      </STitleWrap>
      <Button onClick={handleNextBtn} showLoading={showLoading}>
        다음
      </Button>
      {showModal && <RejectionModal handleGeo={handleGeo} setShowModal={setShowModal} showModal={showModal} />}
    </SLayout>
  );
};

export default Permission;

const SLayout = styled.section`
  position: relative;
  height: 100%;
  text-align: center;
`;

const STitleWrap = styled.div`
  padding-top: 150px;

  & > h2 {
    font-size: 22px;

    &::after {
      content: '';
      display: block;
      width: 100%;
      height: 1px;
      background-color: var(--gray-400);
      margin: 50px 0;
    }
  }

  & + button {
    position: absolute;
    left: 0;
    bottom: 20px;
  }

  h2 {
    padding: 0 20px;
    line-height: 1.6;
  }
`;

const SPermissionInfoWrap = styled.div`
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 20px;

  div:nth-of-type(1) {
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 52px;
    height: 52px;
    background-color: var(--orange);
    border-radius: 50%;

    img {
      width: 32px;
      height: 32px;
    }
  }

  div:nth-of-type(2) {
    text-align: start;

    h3 {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
    }

    p {
      color: var(--gray-800);
      line-height: 1.4;
    }
  }
`;
