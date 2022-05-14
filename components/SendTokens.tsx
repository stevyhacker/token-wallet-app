// Import the crypto getRandomValues shim (**BEFORE** the shims)
import "react-native-get-random-values"

// Import the ethers shims (**BEFORE** ethers)
import "@ethersproject/shims"

import {Contract, ethers} from "ethers";

import {ActivityIndicator, Linking, StyleSheet, TextInput, TouchableOpacity} from 'react-native';

import {Text, View} from './Themed';
import {useState} from "react";

import erc20Abi from "../constants/abis/erc20.json";
import {FAU_TOKEN_ADDRESS, moralisRPC, privateKey} from "../constants/Constants";
import {formatEther, parseEther} from "ethers/lib/utils";

export default function SendTokens() {

    const provider = new ethers.providers.JsonRpcProvider(moralisRPC);
    const wallet = new ethers.Wallet(privateKey, provider);
    const fauTokenContract = new Contract(FAU_TOKEN_ADDRESS, erc20Abi, provider);

    const [inputAddress, setInputAddress] = useState('');
    const [tokenAmount, setTokenAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [approve, setApprove] = useState(true);
    const [txHash, setTxHash] = useState('');
    const [transfer, setTransfer] = useState(false);

    function validInput() {
        return ethers.utils.isAddress(inputAddress) && parseFloat(tokenAmount) > 0;
    }

    function sendApproveTransaction() {
        if (validInput()) {
            setLoading(true);
            fauTokenContract.connect(wallet).approve(inputAddress, parseEther(tokenAmount)).then(tx => {
                setTxHash(tx.hash)
                tx.wait(1).then(function () {
                    setTxHash('')
                    setLoading(false);
                    setTransfer(true);
                    setApprove(false);
                }).catch(function (e) {
                    console.log(e);
                });
            });
        } else {
            alert("Invalid input!");
        }
    }

    async function checkAllowance() {
        const allowance = await fauTokenContract.allowance(wallet.address, inputAddress);
        return parseFloat(formatEther(allowance)) >= parseFloat(tokenAmount);
    }

    async function checkFunds() {
        const balance = await fauTokenContract.balanceOf(wallet.address);
        console.log("Balance: " + formatEther(balance) + " tokenAmount: " + tokenAmount)
        return parseFloat(formatEther(balance)) >= parseFloat(tokenAmount);
    }

    async function sendTransferTransaction() {
        let hasAllowance = await checkAllowance();
        let hasFunds = await checkFunds();

        if (validInput() && hasAllowance && hasFunds) {
            setLoading(true);
            fauTokenContract.connect(wallet).transfer(inputAddress, parseEther(tokenAmount)).then(tx => {
                setTxHash(tx.hash)
                tx.wait(1).then(function () {
                    setLoading(false);
                    setTxHash('')
                    alert("Sent successfully " + tokenAmount + " FAU to " + inputAddress);
                }).catch(function (e) {
                    console.log(e);
                });
            })
        } else {
            if (!hasFunds)
                alert("Not enough funds!");
            if (!hasAllowance)
                alert("You need to approve the token!");
            if (!validInput())
                alert("Please check your input address and amount!");
        }
    }

    return (
        <View>
            <View style={styles.getStartedContainer}>
                <Text
                    style={styles.titleText}
                    lightColor="rgba(0,0,0,0.8)"
                    darkColor="rgba(255,255,255,0.8)">
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Recipient address"
                    autoFocus={true}
                    onChangeText={address => setInputAddress(address)}
                    defaultValue={inputAddress}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Token amount"
                    onChangeText={amount => setTokenAmount(amount)}
                    defaultValue={tokenAmount}
                    keyboardType="numeric"
                />

                {approve && <TouchableOpacity
                    onPress={() => {
                        sendApproveTransaction();
                    }}
                >
                    <Text style={styles.button}>Approve</Text>
                </TouchableOpacity>
                }

                {transfer && <TouchableOpacity
                    onPress={() => {
                        sendTransferTransaction().catch(e => console.log(e));
                    }}
                >
                    <Text style={styles.button}>Transfer</Text>

                </TouchableOpacity>}

                {loading &&
                    <View>
                        <Text style={{marginTop: 15, textAlign: 'center'}}>Waiting for tx confirmation</Text>
                        {txHash.length > 0 &&
                            <Text style={{color: 'blue', textAlign: 'center', marginTop: 10}}
                                  onPress={() => Linking.openURL("https://rinkeby.etherscan.io/tx/" + txHash)}>
                                {"https://rinkeby.etherscan.io/tx/" + txHash}
                            </Text>
                        }
                        <ActivityIndicator style={{marginTop: 15}} size="large" animating={loading}/>
                    </View>
                }

            </View>
        </View>
    );

}

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
    input: {
        marginTop: 12,
        height: 50,
        width: 240,
        padding: 8,
        textAlign: "center",
        borderRadius: 12,
        borderWidth: 0.3,
        borderColor: "#f19090",
    },
    button: {
        borderWidth: 0.25,
        padding: 15,
        margin: 15,
        borderRadius: 12,
        backgroundColor: "#ffe9be",
        borderColor: "#f19090",
        fontSize: 24,
        fontWeight: "bold",
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
});
