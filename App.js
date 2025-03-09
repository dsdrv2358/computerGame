import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, ImageBackground, Animated } from 'react-native';
import Svg, { Line } from 'react-native-svg';

const App = () => {
  const [connections, setConnections] = useState([]); // Store connections
  const [activeComputer, setActiveComputer] = useState(null); // Store active computer for connection
  const [leftComputers, setLeftComputers] = useState([]); // Store randomized left computers
  const [rightComputers, setRightComputers] = useState([]); // Store randomized right computers
  const [isCorrectOrder, setIsCorrectOrder] = useState(false); // Check if the correct order is drawn
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity value

  const expectedComputers = [1, 2, 3, 4, 5, 6, 7, 8]; // Define the correct sequence of computers
  const expectedPairs = expectedComputers
    .slice(0, -1)
    .map((id, index) => [id, expectedComputers[index + 1]].sort().join('-')); // Generate expected connection keys

  // Shuffle an array
  const shuffleArray = (array) => {
    return array
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  };

  // Initialize and randomize computer order
  useEffect(() => {
    setLeftComputers(shuffleArray([1, 3, 5, 7])); // Odd numbers for the left column
    setRightComputers(shuffleArray([2, 4, 6, 8])); // Even numbers for the right column
  }, []);

  // Check if all expected pairs are connected and there are no extra connections
  const checkCorrectOrder = (currentConnections) => {
    const connectionKeys = new Set(currentConnections.map((c) => c.key));

    // Ensure all expected pairs are present
    const hasAllPairs = expectedPairs.every((pair) => connectionKeys.has(pair));

    // Ensure no extra connections exist
    const noExtraConnections = currentConnections.length === expectedPairs.length;

    const isCorrect = hasAllPairs && noExtraConnections;
    setIsCorrectOrder(isCorrect);

    if (isCorrect) {
      setModalVisible(true);
      Animated.timing(fadeAnim, {
        toValue: 1, // Fade to full opacity
        duration: 500, // Duration of fade-in effect in milliseconds
        useNativeDriver: true, // Use native driver for better performance
      }).start();
    }
  };

  // Handle computer click (for both left and right computers)
  const handleClick = (event, computerId) => {
    const { pageX, pageY } = event.nativeEvent;

    if (activeComputer) {
      // Create a unique connection key (sorted to make it bidirectional)
      const connectionKey = [activeComputer.id, computerId].sort().join('-');

      // Check if the connection already exists
      const isAlreadyConnected = connections.some(
        (connection) => connection.key === connectionKey
      );

      let updatedConnections;
      if (isAlreadyConnected) {
        // Remove the connection if it exists
        updatedConnections = connections.filter((connection) => connection.key !== connectionKey);
      } else if (activeComputer.id !== computerId) {
        // Add a new connection if it doesn't already exist
        updatedConnections = [
          ...connections,
          {
            key: connectionKey, // Unique key for this pair
            from: activeComputer,
            to: { x: pageX, y: pageY, id: computerId },
          },
        ];
      } else {
        updatedConnections = connections;
      }

      setConnections(updatedConnections);
      checkCorrectOrder(updatedConnections); // Check if the connections are correct
      setActiveComputer(null); // Clear the active computer after creating/removing a connection
    } else {
      // Set the clicked computer as the active computer
      setActiveComputer({ x: pageX, y: pageY, id: computerId });
    }
  };

  return (
    <View style={styles.container}>
      {/* Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.modalBackground, { opacity: fadeAnim }]}>
            <ImageBackground
              source={require('./assets/ali.png')}
              style={styles.imageBackground}
            >
            </ImageBackground>
          </Animated.View>
        </View>
      </Modal>

      {/* Drawing lines from connections */}
      <Svg style={StyleSheet.absoluteFillObject}>
        {connections.map((connection, index) => (
          <Line
            key={index}
            x1={connection.from.x}
            y1={connection.from.y}
            x2={connection.to.x}
            y2={connection.to.y}
            stroke="red"
            strokeWidth="4"
          />
        ))}
      </Svg>

      {/* Left-side clickable items (Odd numbers) */}
      <View style={[styles.column, { flex: 0.5 }]}>
        {leftComputers.map((computerId) => (
          <View
            key={`left-${computerId}`}
            style={styles.computer}
            onStartShouldSetResponder={() => true}
            onResponderGrant={(event) => handleClick(event, computerId)} // Handle click
          >
            <ImageBackground
              source={require('./assets/computer.png')}
              style={styles.buttonImageBackground}
            >
              <Text style={styles.computerNumber}>{computerId}</Text>
            </ImageBackground>
          </View>
        ))}
      </View>

      {/* Right-side clickable items (Even numbers) */}
      <View style={[styles.column, { flex: 0.5 }]}>
        {rightComputers.map((computerId) => (
          <View
            key={`right-${computerId}`}
            style={styles.computer}
            onStartShouldSetResponder={() => true}
            onResponderGrant={(event) => handleClick(event, computerId)} // Handle click
          >
            <ImageBackground
              source={require('./assets/computer.png')} // Use your image as the button background
              style={styles.buttonImageBackground}
            >
              <Text style={styles.computerNumber}>{computerId}</Text>
            </ImageBackground>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row', // Ensure the columns are positioned side by side
  },
  column: {
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  computer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonImageBackground: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8, // You can adjust this to match your image's design
  },
  computerNumber: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white', // Ensure the number is visible on top of the image
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalBackground: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
