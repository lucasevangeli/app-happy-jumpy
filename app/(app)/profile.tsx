import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import {
  User,
  Phone,
  Calendar,
  FileText, // Changed from Hash
  MapPin,
  Home,
  Mail,
  ChevronLeft,
} from 'lucide-react-native';
import {
  maskCPF_CNPJ,
  maskPhone,
  maskCEP,
  maskDate,
  displayMaskCPF, // Import new display mask
} from '../../utils/masks';

const NEON_GREEN = '#00ff6a';
const ICON_COLOR = '#6d6d6d';
const ICON_SIZE = 20;

const FixedHeader = ({ title }: { title: string }) => {
  const router = useRouter();
  return (
    <View style={styles.fixedHeader}>
      {router.canGoBack() ? (
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color="#000" size={28} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 40, marginRight: 15 }} /> // Placeholder
      )}
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
};

const CompleteProfileScreen = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const initialData = useRef<any>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [province, setProvince] = useState('');

  // Effect to pre-fill form and set initial data for dirty checking
  useEffect(() => {
    if (profile) {
      const initial = {
        fullName: profile.fullName || '',
        phone: maskPhone(profile.phone || ''),
        birthDate: maskDate(profile.birthDate || ''),
        cpfCnpj: displayMaskCPF(profile.cpfCnpj || ''),
        postalCode: maskCEP(profile.postalCode || ''),
        address: profile.address || '',
        addressNumber: profile.addressNumber || '',
        complement: profile.complement || '',
        province: profile.province || '',
      };
      
      setFullName(initial.fullName);
      setPhone(initial.phone);
      setBirthDate(initial.birthDate);
      setCpfCnpj(initial.cpfCnpj);
      setPostalCode(initial.postalCode);
      setAddress(initial.address);
      setAddressNumber(initial.addressNumber);
      setComplement(initial.complement);
      setProvince(initial.province);

      initialData.current = initial;
      setIsDirty(false);
    }
  }, [profile]);

  // Effect to check if form is dirty
  useEffect(() => {
    if (!initialData.current) {
      // If there's no initial data, any input makes it dirty
      if (fullName || phone || birthDate || cpfCnpj || postalCode || address || addressNumber || complement || province) {
        setIsDirty(true);
      }
      return;
    };

    const currentData = {
      fullName, phone, birthDate, cpfCnpj, postalCode, 
      address, addressNumber, complement, province
    };
    
    // Naive dirty check, but good enough for this use case.
    const hasChanged = JSON.stringify(currentData) !== JSON.stringify(initialData.current);
    setIsDirty(hasChanged);

  }, [fullName, phone, birthDate, cpfCnpj, postalCode, address, addressNumber, complement, province]);
  
  const handleCpfFocus = () => {
    // When user focuses, show the real masked value for typing
    if (profile?.cpfCnpj) {
      setCpfCnpj(maskCPF_CNPJ(profile.cpfCnpj));
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) {
      Alert.alert('Erro', 'Você não está autenticado.');
      return;
    }

    const requiredFields = {
      fullName, phone, cpfCnpj, address, addressNumber, province, postalCode,
    };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        Alert.alert('Erro', `O campo ${key} é obrigatório.`);
        return;
      }
    }

    setLoading(true);
    try {
      const token = await user.getIdToken();
      const unmask = (value: string) => value.replace(/\D/g, '');

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/profile`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
          body: JSON.stringify({
            fullName,
            phone: unmask(phone),
            birthDate,
            cpfCnpj: unmask(cpfCnpj),
            address,
            addressNumber,
            complement,
            province,
            postalCode: unmask(postalCode),
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Não foi possível atualizar o perfil.');
      }

      Alert.alert('Sucesso', 'Seu perfil foi atualizado!');
      setIsDirty(false); // Reset dirty state after successful save
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FixedHeader title="Meu Perfil" />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <User size={40} color={NEON_GREEN} />
          </View>
          <Text style={styles.profileHeaderText}>Gerencie seus dados</Text>
        </View>

        <View style={styles.inputContainer}>
          <User size={ICON_SIZE} color={ICON_COLOR} />
          <TextInput style={styles.input} placeholder="Nome Completo" value={fullName} onChangeText={setFullName} autoCapitalize="words"/>
        </View>

        <View style={styles.inputContainer}>
          <Phone size={ICON_SIZE} color={ICON_COLOR} />
          <TextInput style={styles.input} placeholder="Telefone" value={phone} onChangeText={(text) => setPhone(maskPhone(text))} maxLength={15} keyboardType="phone-pad" />
        </View>
        <View style={styles.inputContainer}>
          <Calendar size={ICON_SIZE} color={ICON_COLOR} />
          <TextInput style={styles.input} placeholder="Nascimento" value={birthDate} onChangeText={(text) => setBirthDate(maskDate(text))} maxLength={10} keyboardType="numeric" />
        </View>

        <View style={styles.inputContainer}>
          <FileText size={ICON_SIZE} color={ICON_COLOR} />
          <TextInput
            style={styles.input}
            placeholder="CPF/CNPJ"
            value={cpfCnpj}
            onFocus={handleCpfFocus}
            onChangeText={(text) => setCpfCnpj(maskCPF_CNPJ(text))}
            maxLength={18}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Mail size={ICON_SIZE} color={ICON_COLOR} />
          <TextInput style={styles.input} placeholder="CEP" value={postalCode} onChangeText={(text) => setPostalCode(maskCEP(text))} maxLength={9} keyboardType="numeric" />
        </View>
        
        <View style={styles.inputContainer}>
          <MapPin size={ICON_SIZE} color={ICON_COLOR} />
          <TextInput style={styles.input} placeholder="Endereço" value={address} onChangeText={setAddress} />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputContainer, styles.inputGroup]}>
            <Home size={ICON_SIZE} color={ICON_COLOR} />
            <TextInput style={styles.input} placeholder="Número" value={addressNumber} onChangeText={setAddressNumber} keyboardType="numeric" />
          </View>
          <View style={[styles.inputContainer, styles.inputGroup]}>
            <Home size={ICON_SIZE} color={ICON_COLOR} />
            <TextInput style={styles.input} placeholder="Complemento" value={complement} onChangeText={setComplement} />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Home size={ICON_SIZE} color={ICON_COLOR} />
          <TextInput style={styles.input} placeholder="Bairro" value={province} onChangeText={setProvince} />
        </View>

        <TouchableOpacity style={[styles.button, !isDirty && styles.buttonDisabled]} onPress={handleProfileUpdate} disabled={!isDirty || loading}>
          <Text style={styles.buttonText}>{loading ? 'Salvando...' : 'Salvar Alterações'}</Text>
        </TouchableOpacity>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Versão do App 1.0.0</Text>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Termos de Serviço</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#101010' 
  },
  fixedHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 10, 
    paddingHorizontal: 15, 
    backgroundColor: '#101010', 
    borderBottomWidth: 1, 
    borderBottomColor: '#222', 
    marginTop: Constants.statusBarHeight 
  },
  backButton: { 
    backgroundColor: NEON_GREEN, 
    borderRadius: 20, 
    padding: 6, 
    marginRight: 15 
  },
  headerTitle: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  scrollContainer: { 
    padding: 25 
  },
  profileHeader: { 
    alignItems: 'center', 
    marginBottom: 30 
  },
  avatarContainer: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: '#1C1C1E', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  profileHeaderText: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#fff' 
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  inputGroup: { 
    width: '48%' 
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    width: '100%', 
    height: 55, 
    backgroundColor: '#1C1C1E', 
    borderRadius: 15, 
    paddingHorizontal: 15, 
    marginBottom: 15 
  },
  input: { 
    flex: 1, 
    height: '100%', 
    paddingHorizontal: 10, 
    fontSize: 16, 
    color: '#bebebe' 
  },
  button: { 
    width: '100%', 
    height: 60, 
    backgroundColor: NEON_GREEN, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 50, 
    marginTop: 20 
  },
  buttonText: { 
    color: '#000', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  buttonDisabled: { 
    backgroundColor: '#00ff8880' 
  }, // Semi-transparent green
  footerContainer: { 
    marginTop: 40, 
    alignItems: 'center' 
  },
  footerText: { 
    color: '#6d6d6d', 
    fontSize: 12 
  },
  footerLink: { 
    color: NEON_GREEN, 
    fontSize: 12, 
    marginTop: 5 
  },
});

export default CompleteProfileScreen;
