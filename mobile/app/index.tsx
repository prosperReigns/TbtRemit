import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text>Rollremit.</Text>
      <StatusBar style="auto" />
      <Link to="/profile" style={{ color: 'blue' }}>Profile page</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
      display: 'flex',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
});