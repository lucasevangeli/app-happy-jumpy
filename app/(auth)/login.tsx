import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  Modal,
  Pressable,
  SafeAreaView,
  Platform,
  Image,
} from 'react-native';
import React, { useState, useRef, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { X, User, Lock, Eye, EyeOff } from 'lucide-react-native';
import { Video } from 'expo-av';
import * as WebBrowser from 'expo-web-browser';

const NEON_GREEN = '#00ff6a';
const ICON_COLOR = '#6d6d6d';
const ICON_SIZE = 20;
const VIDEO_URL =
  'https://firebasestorage.googleapis.com/v0/b/happy-jumpy.firebasestorage.app/o/videoapresentacao%2FComercial%20Vila%20Trampolim.mp4?alt=media&token=a54e7b7e-4659-4f08-832c-e57415efc981';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const video = useRef(null);

  useFocusEffect(
    useCallback(() => {
      // Torna a barra de navegação transparente (apenas Android)
      if (Platform.OS === 'android') {
        SystemUI.setBackgroundColorAsync('transparent');
      }

      // A função de limpeza é executada quando a tela perde o foco
      return () => {
        if (Platform.OS === 'android') {
          // Volta para a cor padrão do app (preto)
          SystemUI.setBackgroundColorAsync('#000000');
        }
      };
    }, [])
  );

  const handleOpenModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setModalVisible(true);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setIsPasswordVisible(false);
    setIsConfirmPasswordVisible(false);
  };

  const handleAuthentication = async () => {
    if (authMode === 'signup' && password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
    setLoading(true);
    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      setModalVisible(false);
    } catch (error: any) {
      const friendlyMessage =
        authMode === 'login' ? 'Erro no Login' : 'Erro no Cadastro';
      Alert.alert(friendlyMessage, error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkPress = (url: string) => {
    WebBrowser.openBrowserAsync(url);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <Video
        ref={video}
        style={styles.video}
        source={{
          uri: VIDEO_URL,
        }}
        isMuted
        shouldPlay
        isLooping
        resizeMode="cover"
      />
      <View style={styles.overlay} />

      <SafeAreaView style={styles.contentContainer}>
        <Image
          source={require('../../assets/images/HappyJump46.png')}
          style={styles.logo}
        />

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleOpenModal('login')}
          >
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonOutline]}
            onPress={() => handleOpenModal('signup')}
          >
            <Text style={styles.buttonOutlineText}>Criar Conta</Text>
          </TouchableOpacity>

          <View style={styles.legalContainer}>
            <Text style={styles.legalText}>
              Ao continuar, você concorda com nossos{' '}
            </Text>
            <TouchableOpacity
              onPress={() => handleLinkPress('https://example.com/terms')}
            >
              <Text style={styles.legalLink}>Termos de Uso</Text>
            </TouchableOpacity>
            <Text style={styles.legalText}> e </Text>
            <TouchableOpacity
              onPress={() => handleLinkPress('https://example.com/privacy')}
            >
              <Text style={styles.legalLink}>Políticas de Privacidade</Text>
            </TouchableOpacity>
            <Text style={styles.legalText}>.</Text>
          </View>
        </View>
      </SafeAreaView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <X size={24} color={ICON_COLOR} />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>
              {authMode === 'login' ? 'Entrar' : 'Criar Conta'}
            </Text>

            <View style={styles.inputContainer}>
              <User size={ICON_SIZE} color={ICON_COLOR} />
              <TextInput
                style={styles.input}
                placeholder="E-mail"
                placeholderTextColor={ICON_COLOR}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={ICON_SIZE} color={ICON_COLOR} />
              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor={ICON_COLOR}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
              />
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                {isPasswordVisible ? (
                  <EyeOff size={ICON_SIZE} color={ICON_COLOR} />
                ) : (
                  <Eye size={ICON_SIZE} color={ICON_COLOR} />
                )}
              </TouchableOpacity>
            </View>

            {authMode === 'signup' && (
              <View style={styles.inputContainer}>
                <Lock size={ICON_SIZE} color={ICON_COLOR} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirmar Senha"
                  placeholderTextColor={ICON_COLOR}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!isConfirmPasswordVisible}
                />
                <TouchableOpacity
                  onPress={() =>
                    setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                  }
                >
                  {isConfirmPasswordVisible ? (
                    <EyeOff size={ICON_SIZE} color={ICON_COLOR} />
                  ) : (
                    <Eye size={ICON_SIZE} color={ICON_COLOR} />
                  )}
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={handleAuthentication}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading
                  ? 'Processando...'
                  : authMode === 'login'
                  ? 'Confirmar Entrada'
                  : 'Confirmar Cadastro'}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 25,
  },
  logo: {
    width: '100%',
    height: 100,
    resizeMode: 'contain',
    marginTop: 40,
  },
  bottomContainer: {
    width: '100%',
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
    height: 55,
    backgroundColor: NEON_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    marginTop: 10,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: NEON_GREEN,
  },
  buttonOutlineText: {
    color: NEON_GREEN,
    fontSize: 18,
    fontWeight: 'bold',
  },
  legalContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
  },
  legalText: {
    color: '#A9A9A9',
    fontSize: 12,
  },
  legalLink: {
    color: '#A9A9A9',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  // --- Modal Styles ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#101010',
    padding: 25,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
});

export default LoginScreen;
