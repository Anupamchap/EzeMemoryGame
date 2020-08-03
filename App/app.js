import React from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Image,
  Text,
  Dimensions,
  TouchableOpacity,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';


import {AVAILABLE_CARDS} from './data/availableCards';

const screen = Dimensions.get('window');
const CARD_WIDTH = Math.floor(screen.width * 0.125);
const CARD_HEIGHT = Math.floor(CARD_WIDTH * (323 / 222));

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#33A4FF',
    flex: 1,
  },
  title: {
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: 'white',
    fontSize: 20,
  },
  timer: {
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: 'white',
    fontSize: 10,
  },
  safearea: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginVertical: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderColor: '#fff',
    borderWidth: 5,
    borderRadius: 3,
  },
  cardImage: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
});

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

class Card extends React.Component {
  render() {
    const onPress = this.props.onPress;
    const displayImage = this.props.display
      ? this.props.displayImage
      : require('../App/assets/card-back.png');

    return (
      <TouchableOpacity onPress={onPress}>
        <View style={styles.card}>
          <Image style={styles.cardImage} source={displayImage} />
        </View>
      </TouchableOpacity>
    );
  }
}

class Row extends React.Component {
  render() {
    return <View style={styles.row}>{this.props.children}</View>;
  }
}

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      steps: 0,
      rows: this.createRows(),
      lastselected: {},
      count: 0,
      timer: 0,
      //totalcards: 48,
      //cardsinline: 6,
    };
    //this.timerref = React.createRef();
  }

  resetGame = () => {
    console.log('reset');
    let rows = this.createRows();
    this.setState({
      steps: 0,
      rows: rows,
      lastselected: {},
      count: 0,
      timer: 0,
    });
  };

  createRows = () => {
    var arr = [];
    let rows = [];
    let columns = [];

    while (arr.length < 30 / 2) {
      var r = Math.floor(Math.random() * 52);
      if (arr.indexOf(r) === -1) {
        arr.push(r);
      }
    }
    arr = arr.concat(arr);
    arr = shuffle(arr);

    arr.map((i, index) => {
      let newobj = {};
      newobj.id = index;
      newobj.display = false;
      newobj.solved = false;
      newobj.value = AVAILABLE_CARDS[i];
      columns.push(newobj);
      if ((index + 1) % 5 === 0) {
        rows.push(columns);
        columns = [];
      }
    });
    return rows;
  };

  handleCardPress = async (card) => {
    await this.setState({steps: this.state.steps + 1});
    this.state.rows.map((row, rowIndex) => {
      row.map(async (r) => {
        if (r.id === card.id) {
          r.display = true;
          if (Object.keys(this.state.lastselected).length === 0) {
            this.setState({lastselected: r});
          } else {
            if (
              r.value === this.state.lastselected.value &&
              r.id !== this.state.lastselected.id
            ) {
              await this.setState({count: this.state.count + 2});
              console.log('match' + this.state.count);
              r.solved = true;
              this.state.rows.map((row, rowIndex) => {
                row.map((r) => {
                  if (r.id === this.state.lastselected.id) {
                    r.solved = true;
                  }
                });
              });
            } else {
              setTimeout(() => {
                this.state.rows.map((row, rowIndex) => {
                  row.map((r) => {
                    if (
                      r.id === this.state.lastselected.id &&
                      r.solved !== true
                    ) {
                      r.display = false;
                    }
                  });
                });
                this.setState({rows: this.state.rows});
                this.setState({lastselected: r});
              }, 250);
            }
          }
        }
      });
    });
    this.setState({rows: this.state.rows});

    console.log(this.state.steps);
    if (this.state.steps == 1) {
      this.onFirst();
    }

    console.log('last' + this.state.count);
    if (this.state.count == 30) {
      this.onLast();
    }
  };

  onFirst = () => {
    this.timer = setInterval(() => {
      this.setState((prevState) => ({
        timer: prevState.timer + 1,
      }));
    }, 1000);
  };

  onLast = () => {
    clearInterval(this.timer);
    setTimeout(
      () =>
        Alert.alert(
          'Congratulations!!',
          `You have completed the puzzle in ${this.state.steps} steps and ${this.state.timer} seconds.`,
          [{text: 'OK', onPress: this.resetGame}],
          {cancelable: false},
        ),
      1,
    );
  };

  render() {
    /*this.state.rows.map((row, rowIndex) => {
      console.log(row, rowIndex);
    });*/
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.title}>Memory Game</Text>
        <Text style={styles.timer} id="timer" onFirst={this.onFirst}>
          Timer:{this.state.timer}
        </Text>
        <Text style={styles.timer}>Steps:{this.state.steps}</Text>
        <SafeAreaView style={styles.safearea}>
          {this.state.rows.map((row, rowIndex) => (
            <Row key={rowIndex} index={rowIndex}>
              {row.map((card, index) => {
                //const cardId = `${row.name}-${card.image}-${index}`;
                //const displayImage = card.image;
                return (
                  <Card
                    key={card.id}
                    display={card.display}
                    solved={card.solved}
                    displayImage={card.value}
                    onPress={() => this.handleCardPress(card)}
                  />
                );
              })}
            </Row>
          ))}
        </SafeAreaView>
      </View>
    );
  }
}

export default App;
