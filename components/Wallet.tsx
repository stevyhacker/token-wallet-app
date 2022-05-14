// Import the crypto getRandomValues shim (**BEFORE** the shims)
import "react-native-get-random-values"

// Import the ethers shims (**BEFORE** ethers)
import "@ethersproject/shims"

import {Contract, ethers} from "ethers";

import {Linking, StyleSheet} from 'react-native';

import * as Keychain from 'react-native-keychain';

import {Text, View} from './Themed';
import {useEffect, useState} from "react";

import erc20Abi from "../constants/abis/erc20.json";
import {FAU_TOKEN_ADDRESS, moralisRPC, privateKey} from "../constants/Constants";

export default function Wallet() {

    const [ethBalance, setEthBalance] = useState<number>(0);
    const [fauBalance, setFauBalance] = useState<number>(0);

    const provider = new ethers.providers.JsonRpcProvider(moralisRPC);
    const wallet = new ethers.Wallet(privateKey, provider);
    // console.log("Wallet address: " + wallet.address);

    useEffect(() => {
        getEthBalance(wallet.address).then(b => setEthBalance(b));
        getFauBalance(wallet.address).then(b => setFauBalance(b));
    }, [])

    return (
        <View>
            <View style={styles.getStartedContainer}>
                <Text
                    style={styles.titleText}
                    lightColor="rgba(0,0,0,0.8)"
                    darkColor="rgba(255,255,255,0.8)">
                </Text>

                <Text style={styles.titleText}>
                    Address:
                </Text>

                <Text style={styles.walletText}
                      onPress={() => Linking.openURL("https://rinkeby.etherscan.io/address/" + wallet.address)}>
                    {wallet.address}
                </Text>

                <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

                <Text style={styles.titleText}>
                    Balances:
                </Text>

                <Text style={styles.balanceText}>
                    {ethBalance} ETH
                </Text>

                <Text style={styles.balanceText}>
                    {fauBalance} FAU
                </Text>

            </View>
        </View>
    );

    async function getEthBalance(address: string) {
        const balance = await provider.getBalance(address)
        return parseFloat(ethers.utils.formatEther(balance));
    }

    async function getFauBalance(address: string) {
        const fauTokenContract = new Contract(FAU_TOKEN_ADDRESS, erc20Abi, provider);
        const fauTokenBalance = await fauTokenContract.balanceOf(address);
        return parseFloat(ethers.utils.formatEther(fauTokenBalance));
    }
}


// I was just experimenting here on wallet persistence in keychain
//
// async function getWallet() {
//     try {
//         // Retrieve the credentials
//         const credentials = await Keychain.getGenericPassword();
//         if (credentials) {
//             console.log(
//                 'Private key successfully loaded for user ' + credentials.username + " " + credentials.password
//             );
//             return credentials.password;
//         } else {
//             console.log('No wallet stored');
//             //Generates and stores a new wallet
//             const username = 'vitalik';
//             const privateKey = ethers.Wallet.createRandom().privateKey;
//             console.log("Private key: " + privateKey);
//
//             // Store the credentials
//             await Keychain.setGenericPassword(username, privateKey);
//         }
//     } catch (error) {
//         console.log("Keychain couldn't be accessed!", error);
//     }
// }

const styles = StyleSheet.create({
    getStartedContainer: {
        alignItems: 'center',
        marginHorizontal: 50,
    },
    titleText: {
        fontSize: 24,
        fontWeight: "bold",
        lineHeight: 24,
        marginBottom: 10,
        marginTop: 20,
        textAlign: 'center',
    },
    walletText: {
        color: 'blue',
        fontSize: 21,
        lineHeight: 24,
        textAlign: 'center',
        marginTop: 8,
    },
    balanceText: {
        fontSize: 21,
        lineHeight: 24,
        textAlign: 'center',
        marginTop: 8,
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
});
