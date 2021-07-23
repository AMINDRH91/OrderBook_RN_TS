import { Typography } from "components/molecules/Typography";
import React, {useEffect, useState } from "react";
import {
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  View,
  Text,ActivityIndicator,Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "theme";
import { wp, hp } from "styles/screenResize";
import { FlatList } from "react-native-gesture-handler";
import MaterialIcons from 'react-native-vector-icons/Ionicons'
import {
  Dropdown
} from 'sharingan-rn-modal-dropdown';
var ID = function () {
  return "_" + Math.random().toString(36).substr(2, 9);
};
let interval;
const webSocketPath = "wss://www.cryptofacilities.com/ws/v1";

let latestDataFromSocket;
const HomeScreen = () => {
  
  const [mainBidPool,setMainBidPool] = useState([])
  const [mainAskPool,setMainAskPool] = useState([])
  const [loading,setLoading] = useState(false)
  const [kill,setKill] = useState(0)
  const [defaultCurrency,setDefaultCurrency] = useState('PI_XBTUSD')
  const [grouped,setGrouped] = useState({
    value: '1',
    label: '0.5',
  })
  let ws = new WebSocket(webSocketPath);
  ws.onmessage = (e) => {
    const parsedData = JSON.parse(e.data)
    if(parsedData.hasOwnProperty('asks')){
      latestDataFromSocket = parsedData ;
    }
  };

  ws.onerror = (e) => {
    Alert.alert(e,"An Error occured")
  };

  ws.onclose = (e) => {
    Alert.alert(e.reason,"An Error occured")
  }
useEffect(()=>{
  setTimeout(() => {
    ws.readyState === 1 ?subscribeToWS("subscribe","book_ui_1",["PI_XBTUSD"]) : setTimeout(() => {
      subscribeToWS("subscribe","book_ui_1",["PI_XBTUSD"])
    }, 400);
  }, 700);
  return () => clearInterval(interval);
},[])
  const subscribeToWS = (
    event: string,
    feed: string,
    product_ids: Array<string>
  ) => {
    console.log("========================",ws.readyState)
    if(ws.readyState === 1){
      if(event === "unsubscribe"){
        clearInterval(interval)
        setMainAskPool([])
        setMainBidPool([])
        
        ws.send(
          JSON.stringify({ "event": event, "feed": feed, "product_ids": product_ids }))
      }else{
        interval = setInterval(() => {
          if(latestDataFromSocket != undefined ){
            deciderBids(latestDataFromSocket["bids"])
            deciderAsks(latestDataFromSocket["asks"])
          }
          
        }, 1000);
        ws.send(
          JSON.stringify({ "event": event, "feed": feed, "product_ids": product_ids }))
     
      }
       }else if(ws.readyState === 0 || ws.readyState === 3){
        ws = new WebSocket(webSocketPath);
        if(event === "unsubscribe"){
          clearInterval(interval)
          setMainAskPool([])
          setMainBidPool([])
          ws.send(
            JSON.stringify({ "event": event, "feed": feed, "product_ids": product_ids }))
        }else{
          interval = setInterval(() => {
            if(latestDataFromSocket != undefined ){
              deciderBids(latestDataFromSocket["bids"])
              deciderAsks(latestDataFromSocket["asks"])
            }
            
          }, 300);
          ws.send(
            JSON.stringify({ "event": event, "feed": feed, "product_ids": product_ids }))
       
        }
       }

  };
 
  const deciderBids = (bidsArray) => { 
    if(bidsArray.length > 0){
      if (mainBidPool.length == 0){
        let willBePushed =[];
        bidsArray.forEach((singleNewBid)=>{
          if(singleNewBid[1] != 0 ||singleNewBid[1] != 0.0){
            let newItem = [] 
            newItem[0] = singleNewBid[0]
            newItem[1] = singleNewBid[1]
            newItem[2] = singleNewBid[1]
            willBePushed.push(newItem) 
          }
        })
        willBePushed.sort(function(a, b) {
          return b[0]-a[0];
        });
        const slicedArray = willBePushed.slice(0, 10);
        setMainBidPool(slicedArray);
      }else if(mainBidPool.length > 0){
        console.log("here")
        bidsArray.forEach((singleNewBid)=>{
          if(singleNewBid[1] != 0 ||singleNewBid[1] != 0.0){
            // non zero size
            mainBidPool.forEach((singleMainBid,singleMainBidIndex)=>{
              if(singleMainBid[0] === singleNewBid[0]){
                // the price is available in pool
                let duplicateOfMainPool = [...mainBidPool]
                duplicateOfMainPool[singleMainBidIndex][1]=singleNewBid[1]
                duplicateOfMainPool[singleMainBidIndex][2]=duplicateOfMainPool[singleMainBidIndex][2]+singleNewBid[1]
                duplicateOfMainPool.sort(function(a, b) {
                  return b[0]-a[0];
                });
                const slicedArray = duplicateOfMainPool.slice(0, 10);
                setMainBidPool(slicedArray);
              }else{
                // the price is not available in pool
                let newItem = [] 
                newItem[0] = singleNewBid[0]
                newItem[1] = singleNewBid[1]
                newItem[2] = singleNewBid[1]
                let willBePushed = [...mainBidPool,newItem]
                willBePushed.sort(function(a, b) {
                  return b[0]-a[0];
                });
                const slicedArray = willBePushed.slice(0, 10);
                setMainBidPool(slicedArray)
                
              }
            })
          }else{
            // zero size
            let filteredItem = mainBidPool.filter((singleMainItem) =>{ return singleMainItem[0] != singleNewBid[0]});
            filteredItem.sort(function(a, b) {
              return b[0]-a[0];
            });
            const slicedArray = filteredItem.slice(0, 10);
            setMainBidPool(slicedArray)
          }
        })
      }
    }
  }
  const deciderAsks = (asksArray) => { 
    if(asksArray.length > 0){
      if (mainAskPool.length == 0){
        let willBePushed =[];
        asksArray.forEach((singleNewBid)=>{
          if(singleNewBid[1] != 0 ||singleNewBid[1] != 0.0){
            let newItem = [] 
            newItem[0] = singleNewBid[0]
            newItem[1] = singleNewBid[1]
            newItem[2] = singleNewBid[1]
            willBePushed.push(newItem) 
          }
        })
        willBePushed.sort(function(a, b) {
          return b[0]-a[0];
        });
        const slicedArray = willBePushed.slice(0, 10);
        setMainAskPool(slicedArray);
      }else if(mainAskPool.length > 0){
        console.log("here")
        asksArray.forEach((singleNewBid)=>{
          if(singleNewBid[1] != 0 ||singleNewBid[1] != 0.0){
            // non zero size
            mainAskPool.forEach((singleMainBid,singleMainBidIndex)=>{
              if(singleMainBid[0] === singleNewBid[0]){
                // the price is available in pool
                let duplicateOfMainPool = [...mainAskPool]
                duplicateOfMainPool[singleMainBidIndex][1]=singleNewBid[1]
                duplicateOfMainPool[singleMainBidIndex][2]=duplicateOfMainPool[singleMainBidIndex][2]+singleNewBid[1]
                duplicateOfMainPool.sort(function(a, b) {
                  return b[0]-a[0];
                });
                const slicedArray = duplicateOfMainPool.slice(0, 10);
                setMainAskPool(slicedArray);
              }else{
                // the price is not available in pool
                let newItem = [] 
                newItem[0] = singleNewBid[0]
                newItem[1] = singleNewBid[1]
                newItem[2] = singleNewBid[1]
                let willBePushed = [...mainAskPool,newItem]
                willBePushed.sort(function(a, b) {
                  return b[0]-a[0];
                });
                const slicedArray = willBePushed.slice(0, 10);
                setMainAskPool(slicedArray)
                
              }
            })
          }else{
            // zero size
            let filteredItem = mainAskPool.filter((singleMainItem) =>{ return singleMainItem[0] != singleNewBid[0]});
            filteredItem.sort(function(a, b) {
              return b[0]-a[0];
            });
            const slicedArray = filteredItem.slice(0, 10);
            setMainAskPool(slicedArray)
          }
        })
      }
    }
  }
  const ButtonCustom = (title,backgroundColor="rgba(151,200,250,1)",onPress,width=wp("10%"),height=hp("3%"),iconName) =>{
    return (
      <TouchableOpacity style={{width,height,backgroundColor,justifyContent:"center",alignItems:"center",flexDirection:"row" ,margin:wp("1%")}} onPress={()=>{onPress(title)}} >
      <MaterialIcons name={iconName} size={width/6} color="white" />
      <Text style={{fontSize:width/8,color:"white",padding:4}}>{title}</Text>
    </TouchableOpacity>
    )
  }
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      {loading ? <ActivityIndicator style={{position:"absolute",top:hp("50%"),left:wp("48%")}} size={"large"} /> : null}
      <View style={{ flex: 1, alignItems: "center" }}>
        <View style={{ flex: 1, width: wp("100%") }}>
          <View
            style={{
              height: hp("7%"),
              flexDirection: "row",
              borderBottomWidth: 1,
              borderBottomColor: "grey",
              justifyContent: "space-between",
              alignItems:"center", padding: wp("4%")
            }}
          >
            <Typography color={"white"} fontSize={wp("4%")} variant="bold">
          Order Book
        </Typography>
        <View style={{width:wp("25%"),height:hp("5%"),alignContent:"center",justifyContent:"center"}}>
        <Dropdown
            mainContainerStyle={{width:wp("25%"),backgroundColor:"rgba(255,255,255,.2)",height:hp("5%"),alignContent:"center",justifyContent:"center"}}
            itemTextStyle ={{textAlign:"center",color:"white"}}
            selectedItemTextStyle={{color:"red"}}
            data={[
              {
                value: '1',
                label: '0.50',
              },
              {
                value: '2',
                label: '1.0',
              },
              {
                value: '3',
                label: '1.50',
              },
            ]}
            enableSearch={false}
            value={grouped}
            onChange={setGrouped}
            primaryColor={"white"}
            textInputPlaceholderColor={"white"}
            textInputPlaceholder ={grouped.label}
          />
        </View>
          </View>
          <View
            style={{
              height: hp("4%"),
              flexDirection: "row",
              borderBottomWidth: 1,
              borderBottomColor: "grey",
              justifyContent: "space-between",
              alignItems: "center",
              padding: wp("2%")
            }}
          >
            <Text
              style={{
                flex: 1.5,
                color: "grey",
                fontWeight: "bold",
                fontSize: wp("4%"),
              }}
            >
              Price
            </Text>
            <Text
              style={{
                flex: 1,
                color: "grey",
                fontWeight: "bold",
                fontSize: wp("4%"),
              }}
            >
              Size
            </Text>
            <Text
              style={{
                flex: 1,
                color: "grey",
                fontWeight: "bold",
                fontSize: wp("4%"),
              }}
            >
              Total
            </Text>
          </View>
          <View style={{ flex: 1 }}>

            <View style={{ flex: 1 }} >
              <FlatList
                data={mainBidPool}
                keyExtractor={(item) => ID()}
                renderItem={({ item }) => (
                  <View
                    style={{
                      height: hp("5%"),
                      flexDirection: "row",
                      borderBottomWidth: 0.2,
                      borderBottomColor: "grey",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: wp("2%"),
                    }}
                  >
                    <Text
                      style={{
                        flex: 1.5,
                        color: "green",
                        fontWeight: "bold",
                        fontSize: wp("4%"),
                      }}
                    >
                      {item[0]}
                    </Text>
                    <Text
                      style={{
                        flex: 1,
                        color: "grey",
                        fontWeight: "bold",
                        fontSize: wp("4%"),
                      }}
                    >
                      {item[1]}
                    </Text>
                    <Text
                      style={{
                        flex: 1,
                        color: "grey",
                        fontWeight: "bold",
                        fontSize: wp("4%"),
                      }}
                    >
                      {item[2]}
                    </Text>
                  </View>
                )}
              />
            </View>
            
            <View style={{flex:.1}}/>
            <View style={{ flex: 1 }}>
            <FlatList
                data={mainAskPool}
                keyExtractor={(item) => ID()+2}
                renderItem={({ item }) => (
                  <View
                    style={{
                      height: hp("5%"),
                      flexDirection: "row",
                      borderBottomWidth: 0.2,
                      borderBottomColor: "grey",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: wp("2%"),
                    }}
                  >
                    <Text
                      style={{
                        flex: 1.5,
                        color: "red",
                        fontWeight: "bold",
                        fontSize: wp("4%"),
                      }}
                    >
                      {item[0]}
                    </Text>
                    <Text
                      style={{
                        flex: 1,
                        color: "grey",
                        fontWeight: "bold",
                        fontSize: wp("4%"),
                      }}
                    >
                      {item[1]}
                    </Text>
                    <Text
                      style={{
                        flex: 1,
                        color: "grey",
                        fontWeight: "bold",
                        fontSize: wp("4%"),
                      }}
                    >
                      {item[2]}
                    </Text>
                  </View>
                )}
              />

            </View>
            <View style={{flex:.2,justifyContent:"center",alignItems:"center",flexDirection:"row", backgroundColor: "rgba(125,125,255,.1)"}}>
            {ButtonCustom("Toggle Feed","rgba(87,65,217,1)",()=>{
              setLoading(true)
              if(defaultCurrency ==='PI_XBTUSD' ){
                subscribeToWS("unsubscribe","book_ui_1",["PI_XBTUSD"])
                subscribeToWS("subscribe","book_ui_1",["PI_ETHUSD"])
                setDefaultCurrency("PI_ETHUSD")
              }else{
                subscribeToWS("unsubscribe","book_ui_1",["PI_ETHUSD"])
                subscribeToWS("subscribe","book_ui_1",["PI_XBTUSD"])
                setDefaultCurrency("PI_XBTUSD")
              }
              setLoading(false)
            },wp("30%"),hp("5%"),"swap-horizontal-outline")}
            {ButtonCustom("Kill Feed","red",()=>{
              if(kill === 0){
                console.log("hello")
                ws.close()
                setKill(1)
              }else{
                ws = new WebSocket(webSocketPath)
                ws.readyState ===1 ?  subscribeToWS("subscribe","book_ui_1",["PI_XBTUSD"]):null
                setKill(0)
              }
            },wp("30%"),hp("5%"),"information-circle-outline")}
              </View>
          </View>
        </View>
      </View>
      
    </SafeAreaView>
  );
};
export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.backgroundColor,
  }, 
  backdropStyle: {
    backgroundColor: '#F4F4F5',

    justifyContent:"center"
  },
});
