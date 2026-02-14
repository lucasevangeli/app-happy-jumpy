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
  KeyboardAvoidingView,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import {
  User,
  Phone,
  Calendar,
  Hash,
  MapPin,
  Home,
  Mail,
} from 'lucide-react-native';

const NEON_GREEN = '#00ff6a';
const ICON_COLOR = '#6d6d6d';
const ICON_SIZE = 20;

const CompleteProfileScreen = () => {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // State for all form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [address, setAddress] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');

  useEffect(() => {
    // Pre-fill form with existing profile data
    if (profile) {
      setFullName(profile.fullName || '');
      setPhone(profile.phone || '');
      setBirthDate(profile.birthDate || '');
      setCpfCnpj(profile.cpfCnpj || '');
      setAddress(profile.address || '');
      setAddressNumber(profile.addressNumber || '');
      setComplement(profile.complement || '');
      setProvince(profile.province || '');
      setPostalCode(profile.postalCode || '');
    }
  }, [profile]);

  const handleProfileUpdate = async () => {
    if (!user) {
      Alert.alert('Erro', 'Você não está autenticado.');
      return;
    }

    const requiredFields = {
      fullName,
      phone,
      cpfCnpj,
      address,
      addressNumber,
      province,
      postalCode,
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

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/profile`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName,
            phone,
            birthDate,
            cpfCnpj,
            address,
            addressNumber,
            complement,
            province,
            postalCode,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Não foi possível atualizar o perfil.');
      }

      Alert.alert('Sucesso', 'Seu perfil foi atualizado!');
      // The state change from AuthContext will trigger the redirect in the root layout.
      // No need to manually navigate here.
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Complete seu Perfil</Text>
          <Text style={styles.subtitle}>
            Precisamos de mais algumas informações para finalizar seu cadastro.
          </Text>

          {/* Form Inputs */}
          <View style={styles.inputContainer}>
            <User size={ICON_SIZE} color={ICON_COLOR} />
            <TextInput
              style={styles.input}
              placeholder="Nome Completo"
              placeholderTextColor={ICON_COLOR}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Phone size={ICON_SIZE} color={ICON_COLOR} />
            <TextInput
              style={styles.input}
              placeholder="Telefone"
              placeholderTextColor={ICON_COLOR}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Calendar size={ICON_SIZE} color={ICON_COLOR} />
            <TextInput
              style={styles.input}
              placeholder="Data de Nascimento (YYYY-MM-DD)"
              placeholderTextColor={ICON_COLOR}
              value={birthDate}
              onChangeText={setBirthDate}
            />
          </View>

          <View style={styles.inputContainer}>
            <Hash size={ICON_SIZE} color={ICON_COLOR} />
            <TextInput
              style={styles.input}
              placeholder="CPF/CNPJ"
              placeholderTextColor={ICON_COLOR}
              value={cpfCnpj}
              onChangeText={setCpfCnpj}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <MapPin size={ICON_SIZE} color={ICON_COLOR} />
            <TextInput
              style={styles.input}
              placeholder="Endereço"
              placeholderTextColor={ICON_COLOR}
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <View style={styles.inputContainer}>
            <Home size={ICON_SIZE} color={ICON_COLOR} />
            <TextInput
              style={styles.input}
              placeholder="Número"
              placeholderTextColor={ICON_COLOR}
              value={addressNumber}
              onChangeText={setAddressNumber}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Home size={ICON_SIZE} color={ICON_COLOR} />
            <TextInput
              style={styles.input}
              placeholder="Complemento (opcional)"
              placeholderTextColor={ICON_COLOR}
              value={complement}
              onChangeText={setComplement}
            />
          </View>

          <View style={styles.inputContainer}>
            <Home size={ICON_SIZE} color={ICON_COLOR} />
            <TextInput
              style={styles.input}
              placeholder="Bairro"
              placeholderTextColor={ICON_COLOR}
              value={province}
              onChangeText={setProvince}
            />
          </View>

          <View style={styles.inputContainer}>
            <Mail size={ICON_SIZE} color={ICON_COLOR} />
            <TextInput
              style={styles.input}
              placeholder="CEP"
              placeholderTextColor={ICON_COLOR}
              value={postalCode}
              onChangeText={setPostalCode}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleProfileUpdate}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Salvando...' : 'Salvar Perfil'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#A9A9A9',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 55,
    backgroundColor: '#1C1C1E',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#fff',
  },
  button: {
    width: '100%',
    height: 60,
    backgroundColor: NEON_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    marginTop: 20,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CompleteProfileScreen;
