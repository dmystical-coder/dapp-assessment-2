import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { ethers } from "ethers";
import "./App.css";
import abi from "./abi.json";

const App = () => {
  const contractAddress = "0x563093915cc3F436632c849bad3E8517a926bC09";
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskText, setTaskText] = useState("");
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);

  useEffect(() => {
      checkWalletConnection()
    }, []);
    


  const checkWalletConnection = async () => { 
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      await initializeContract();
    } else {
      toast.error("Connect Wallet to continue");
    }
  }

  const initializeContract = async () => {
    try {
      if (!window.ethereum) {
        toast.error("Oops! Metamask not found. Install MetaMask to connect");
        throw new Error("Oops! Metamask not found");
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const taskContract = new ethers.Contract(contractAddress, abi, signer);
      setContract(taskContract);

      await fetchTasks();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        toast.error("Oops! Metamask not found. Install MetaMask to connect");
        throw new Error("Oops! Metamask not found");
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]); // Set the first account connected
      toast.success("Wallet Connected Successfully!");

      await initializeContract();
    } catch (error) {
      toast.error("Error connecting Wallet");
      console.error("Error connecting wallet:", error);
    }
  };

  const fetchTasks = async (myContract = contract) => {
    if (!myContract) return;

    try {
      const fetchedTasks = await myContract.getMyTask();
      const formattedTasks = fetchedTasks.map((task) => ({
        id: Number(task.id), // Convert BigNumber to string
        taskTitle: task.taskTitle,
        taskText: task.taskText,
        isDeleted: task.isDeleted,
      }));
      console.log("Fetched tasks:", formattedTasks);
      setTasks(formattedTasks);
      toast.success("Task updated!");
    } catch (error) {
      toast.error("Error fetching tasks! Check console for more details.");
      console.error("Error fetching tasks:", error);
    }
  };

  // Add Task
  const addTask = async (e) => {
    e.preventDefault();

    if (!contract)
      return toast.error(
        "Contract not initialized. Please connect wallet and try again."
      );
    if (!taskTitle || !taskText)
      return toast.error("Please fill in all fields.");

    try {
      const tx = await contract.addTask(taskText, taskTitle, false);
      await tx.wait(); // Wait for the transaction to be confirmed
      toast.success("Task added successfully!");

      // Clear the input fields
      setTaskTitle("");
      setTaskText("");
      await fetchTasks(); // Refresh the task list after adding
    } catch (error) {
      toast.error("Error adding task:", error);
    }
  };

  // Delete Task
  const deleteTask = async (id) => {
    if (!contract) return toast.error("Contract not initialized. Please connect wallet and try again.");
    try {
      const tx = await contract.deleteTask(id);
      await tx.wait();
      toast.success("Task deleted successfully!");
      await fetchTasks();
    } catch (error) {
      toast.error("Error deleting task! Check console for more details.");
      console.error("Error:", error);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="card">
        <button className="btn btn1" onClick={connectWallet}>
          {account ? `Connected: ${account.slice(0, 6)}...` : "Connect Wallet"}
        </button>
        <h1>Task Manager DApp</h1>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="input-group">
            <input
              className="input"
              type="text"
              placeholder="Task Title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
            <input
              className="input"
              type="text"
              placeholder="Task Text"
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
            />
          </div>
          <button className="btn btn1" type="submit" onClick={addTask}>
            Add Task
          </button>
        </form>

        <div className="todos-list">
          {!tasks.length ? "" : <h2>
            Tasks
          </h2>}

          <ul className="outer-div">
            {tasks.map((task) => (
              <li key={task.id}>
                <div className="left">
                <h3>{task.taskTitle}</h3>
                <p>{task.taskText}</p>
                </div>
                <div className="right">
                <p>Status: {task.isDeleted ? "Deleted" : "Active"}</p>
                <button className="red" onClick={() => deleteTask(task.id)}>Delete Task</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default App;
