import { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast';
import { ethers } from 'ethers'
import './App.css'
import abi from './abi.json'

const App = () => {
  const contractAddress = '0x563093915cc3F436632c849bad3E8517a926bC09'
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskText, setTaskText] = useState("");
  const [account, setAccount] = useState("");

  const requestAccounts = async () => {
    await window.ethereum.request({ method: 'eth_requestAccounts' })
  }

  const connectAccount = async () => {

    if (typeof window.ethereum !== 'undefined') {
      await requestAccounts()
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]); // Set the first account connected
        toast.success("Wallet Connected Successfully!");
      } catch (error) {
        toast.error("Error connecting Wallet")
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert("MetaMask is not installed. Please install MetaMask to connect.");
    }
  }

  const fetchTasks = async () => {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccounts()

      const provider = new ethers.BrowserProvider(window.ethereum)
      const myContract = new ethers.Contract(contractAddress, abi, provider)
      try {
        const tasksArray = await myContract.getMyTask();
        const formattedTasks = tasksArray.map((task) => ({
          id: task.id.toString(), // Convert BigNumber to string
          taskTitle: task.taskTitle,
          taskText: task.taskText,
          isDeleted: task.isDeleted,
        }));
        console.log("Fetched tasks:", formattedTasks);
        setTasks(formattedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }

      toast.success("Task updated!")
    }
  };

  // Add Task
  const addTask = async () => {
    if (!taskTitle || !taskText) return toast.error("Please fill in all fields.");

    if (typeof window.ethereum !== 'undefined') {
      await requestAccounts()

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const myContract = new ethers.Contract(contractAddress, abi, signer)
      try {
        const tx = await myContract.addTask(taskText, taskTitle, false);
        await tx.wait(); // Wait for the transaction to be confirmed
        toast.success("Task added successfully!");
        setTaskTitle("");
        setTaskText("");
        fetchTasks(); // Refresh the task list after adding
      } catch (error) {
        toast.error("Error adding task:", error);
      }
    
    }


  };

   // Delete Task
   const deleteTask = async (taskId) => {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccounts()

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const myContract = new ethers.Contract(contractAddress, abi, signer)
      try {
        const tx = await myContract.deleteTask(taskId);
        await tx.wait();
        toast.success("Task deleted successfully!");
        fetchTasks();
      } catch (error) {
        console.error("Error:", error);
        toast.error("Error deleting task!");
      }
    }
  };


  useEffect(() => {
    if (account) {
      fetchTasks();
    }
  }, [account]);

  const [latestTask, setLatestTask] = useState(null);

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, abi, provider);

      contract.on("AddTask", (recepient, taskId) => {
        console.log(`New Task Added: ${taskId} by ${recepient}`);
        setLatestTask({ recepient, taskId });
      });

      return () => {
        contract.removeAllListeners("AddTask");
      };
    }
  }, []);

  return (
    <>
    <Toaster position='top-center' />
<div className="card">
    <button className='btn btn1' onClick={connectAccount}>
        {account ? `Connected: ${account.slice(0, 6)}...` : "Connect Wallet"}
      </button>
    <h1>Task Manager DApp</h1>

    <form onSubmit={(e) => e.preventDefault()}>
    <div className="input-group">
      <input
      className='input'
          type="text"
          placeholder="Task Title"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
        />
        <input
        className='input'
          type="text"
          placeholder="Task Text"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
        />
    </div>
      <button className='btn btn1' onClick={addTask}>Add Task</button>
  </form>

    <div className="todos-list">
      <h2>
        <span> Tasks</span>
      </h2>

      <ul>
        {tasks.map((task, index) => (
          <li key={index}>
            <h3>{task.taskTitle}</h3>
            <p>{task.taskText}</p>
            <p>Status: {task.isDeleted ? "Deleted" : "Active"}</p>
            <button onClick={deleteTask}>Delete Task</button>
          </li>
        ))}
      </ul>
      </div>

      <div>
      <h3>Latest Task Event</h3>
      {latestTask ? (
        <p>Task {latestTask.taskId} added by {latestTask.recepient}</p>
      ) : (
        <p>No tasks added yet.</p>
      )}
    </div>
    <div>
      </div>
  </div>
  
    </>
  )
}

export default App
