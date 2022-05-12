// Import the crypto getRandomValues shim (**BEFORE** the shims)
import "react-native-get-random-values"

// Import the ethers shims (**BEFORE** ethers)
import "@ethersproject/shims"

// Import the ethers library
import {Contract, ethers} from "ethers";

import {StyleSheet} from 'react-native';


import {Text, View} from './Themed';
import {useEffect, useState} from "react";

const moralisRPC = "https://speedy-nodes-nyc.moralis.io/c7fc98eca87d511079885e25/eth/rinkeby"
const provider = new ethers.providers.JsonRpcProvider(moralisRPC);
import erc20Abi from "../constants/abis/erc20.json";

export default function Wallet() {

    const [ethBalance, setEthBalance] = useState<number>(0);
    const [fauBalance, setFauBalance] = useState<number>(0);
    const wallet = ethers.Wallet.createRandom();

    useEffect(() => {
        getEthBalance(wallet.address).then(b => setEthBalance(b));
        getFauBalance(wallet.address).then(b => setFauBalance(b));
    }, [])

    return (
        <View>
            <View style={styles.getStartedContainer}>
                <Text
                    style={styles.getStartedText}
                    lightColor="rgba(0,0,0,0.8)"
                    darkColor="rgba(255,255,255,0.8)">
                    Address:
                    {wallet.address}
                </Text>

                <Text style={styles.getStartedText}>
                    Mnemonic:
                    {wallet.mnemonic.phrase}
                </Text>

                <Text style={styles.balanceText}>
                    ETH: {ethBalance}
                </Text>

                <Text style={styles.balanceText}>
                    FAU: {fauBalance}
                </Text>

            </View>
        </View>
    );
}

async function getEthBalance(address: string) {
    const balance = await provider.getBalance(address)
    return parseFloat(ethers.utils.formatEther(balance));
}

async function getFauBalance(address: string) {
    const fauTokenContract = new Contract(FAU_TOKEN_ADDRESS, erc20Abi, provider);
    const fauTokenBalance = await fauTokenContract.balanceOf(address);
    return parseFloat(ethers.utils.formatEther(fauTokenBalance));
}

const styles = StyleSheet.create({
    getStartedContainer: {
        alignItems: 'center',
        marginHorizontal: 50,
    },
    getStartedText: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 10,
        textAlign: 'center',
    },
    balanceText: {
        fontSize: 20,
        lineHeight: 24,
        textAlign: 'center',
        marginTop: 8,
    }
});
