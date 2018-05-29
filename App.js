import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Wearables from "react-native-wearables";
import { VictoryArea, VictoryChart, VictoryAxis } from "victory-native";
import { histogram } from "d3-array";

const ERRORS = {
  failedInit: "failedInit",
  failedQuery: "failedQuery"
};

export default class App extends React.Component {
  state = {
    error: null,
    samples: null
  };

  componentDidMount() {
    Wearables.initHealthKit(
      { permissions: { read: [Wearables.Constants.Permissions.HeartRate] } },
      (err, results) => {
        if (err) {
          this.setState({ error: new Error(ERRORS.failedInit) });
          return;
        }

        Wearables.getHeartRateSamples(
          {
            startDate: new Date("2018-05-01").toISOString()
          },
          (err, results) => {
            if (err) {
              this.setState({ error: new Error(ERRORS.failedInit) });
              return;
            }

            this.setState({ samples: results });
          }
        );
      }
    );
  }

  render() {
    const { error, samples } = this.state;

    let child;
    if (error) {
      child = <Text>Something went wrong :(</Text>;
    } else if (samples) {
      const bins = histogram()(samples.map(s => s.value));
      child = (
        <View>
          <VictoryChart>
            <VictoryArea
              data={bins.map(bin => ({ x: bin.x0, y: bin.length }))}
            />
            <VictoryAxis />
          </VictoryChart>
        </View>
      );
    } else {
      child = <Text>Reading data...</Text>;
    }

    return <View style={styles.container}>{child}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  }
});
