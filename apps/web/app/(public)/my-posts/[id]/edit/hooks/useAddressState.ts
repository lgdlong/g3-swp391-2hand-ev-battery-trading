import { useState, useEffect, useMemo } from 'react';
import { useProvinces, useDistricts } from '@/hooks/useGeo';
import { Post } from '@/types/post';
import { getFlexibleFieldValue } from '../utils/utils';

interface BasicData {
  title: string;
  description: string;
  priceVnd: string;
  isNegotiable: boolean;
  wardCode: string;
  provinceNameCached: string;
  districtNameCached: string;
  wardNameCached: string;
  addressTextCached: string;
  status: string;
}

export function useAddressState(post: Post) {
  const [basicData, setBasicData] = useState<BasicData>({
    title: post.title || '',
    description: post.description || '',
    priceVnd: post.priceVnd ? post.priceVnd.toString() : '',
    isNegotiable: post.isNegotiable || false,
    wardCode: post.wardCode || '',
    provinceNameCached: getFlexibleFieldValue(post.provinceNameCached) || '',
    districtNameCached: getFlexibleFieldValue(post.districtNameCached) || '',
    wardNameCached: getFlexibleFieldValue(post.wardNameCached) || '',
    addressTextCached: getFlexibleFieldValue(post.addressTextCached) || '',
    status: post.status || 'DRAFT',
  });

  const [provinceCode, setProvinceCode] = useState('');
  const [districtCode, setDistrictCode] = useState('');
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);

  // Temporary address state for dialog
  const [tempProvinceCode, setTempProvinceCode] = useState('');
  const [tempDistrictCode, setTempDistrictCode] = useState('');
  const [tempWardCode, setTempWardCode] = useState('');
  const [tempProvinceNameCached, setTempProvinceNameCached] = useState('');
  const [tempDistrictNameCached, setTempDistrictNameCached] = useState('');
  const [tempWardNameCached, setTempWardNameCached] = useState('');
  const [tempAddressTextCached, setTempAddressTextCached] = useState('');

  // Address data fetching
  const provincesQ = useProvinces();
  const districtsQ = useDistricts(provinceCode || undefined);
  const provinces = useMemo(() => provincesQ.data ?? [], [provincesQ.data]);
  const districts = useMemo(() => districtsQ.data ?? [], [districtsQ.data]);

  // Initialize province and district codes from existing data
  useEffect(() => {
    if (provinces.length > 0 && basicData.provinceNameCached && !provinceCode) {
      const province = provinces.find((p) => p.name === basicData.provinceNameCached);
      if (province) {
        setProvinceCode(province.code);
      }
    }
  }, [provinces, basicData.provinceNameCached, provinceCode]);

  useEffect(() => {
    if (districts.length > 0 && basicData.districtNameCached && !districtCode) {
      const district = districts.find((d) => d.name === basicData.districtNameCached);
      if (district) {
        setDistrictCode(district.code);
      }
    }
  }, [districts, basicData.districtNameCached, districtCode]);

  const handleOpenAddressDialog = () => {
    setTempProvinceCode(provinceCode);
    setTempDistrictCode(districtCode);
    setTempWardCode(basicData.wardCode);
    setTempProvinceNameCached(basicData.provinceNameCached);
    setTempDistrictNameCached(basicData.districtNameCached);
    setTempWardNameCached(basicData.wardNameCached);
    setTempAddressTextCached(basicData.addressTextCached);
    setIsAddressDialogOpen(true);
  };

  const handleCancelAddressDialog = () => {
    setTempProvinceCode('');
    setTempDistrictCode('');
    setTempWardCode('');
    setTempProvinceNameCached('');
    setTempDistrictNameCached('');
    setTempWardNameCached('');
    setTempAddressTextCached('');
    setIsAddressDialogOpen(false);
  };

  const handleConfirmAddressDialog = () => {
    setProvinceCode(tempProvinceCode);
    setDistrictCode(tempDistrictCode);
    setBasicData((prev) => ({
      ...prev,
      wardCode: tempWardCode,
      provinceNameCached: tempProvinceNameCached,
      districtNameCached: tempDistrictNameCached,
      wardNameCached: tempWardNameCached,
      addressTextCached: tempAddressTextCached,
    }));
    setIsAddressDialogOpen(false);
  };

  const handleTempProvinceChange = (code: string, name: string) => {
    setTempProvinceCode(code);
    setTempDistrictCode('');
    setTempWardCode('');
    setTempProvinceNameCached(name);
    setTempDistrictNameCached('');
    setTempWardNameCached('');
    setTempAddressTextCached('');
  };

  const handleTempDistrictChange = (code: string, name: string) => {
    setTempDistrictCode(code);
    setTempWardCode('');
    setTempDistrictNameCached(name);
    setTempWardNameCached('');
    setTempAddressTextCached('');
  };

  const handleTempWardChange = (code: string, name: string) => {
    setTempWardCode(code);
    setTempWardNameCached(name);
    const addressCached = [name, tempDistrictNameCached, tempProvinceNameCached]
      .filter(Boolean)
      .join(', ');
    setTempAddressTextCached(addressCached);
  };

  return {
    basicData,
    setBasicData,
    isAddressDialogOpen,
    setIsAddressDialogOpen,
    tempProvinceCode,
    tempDistrictCode,
    tempWardCode,
    handleOpenAddressDialog,
    handleCancelAddressDialog,
    handleConfirmAddressDialog,
    handleTempProvinceChange,
    handleTempDistrictChange,
    handleTempWardChange,
  };
}
