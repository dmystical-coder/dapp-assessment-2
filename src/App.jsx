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
      const tasks = await myContract.getMyTask();
      setTasks(tasks);

      toast.success("Task updated!")
    }
  };

  // Add Task
  const addTask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccounts()

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const myContract = new ethers.Contract(contractAddress, abi, signer)
      try {
        const tx = await myContract.addTask(taskText, taskTitle, false);
        await tx.wait();
        toast.success("Task added successfully!");
        fetchTasks();
    
      } catch (error) {
        console.error("Error:", error);
        toast.error("Error adding task");
      }
      setTaskTitle("")
      setTaskText("")
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

  return (
    <>
    <Toaster position='top-center' />
<div className="card">
    <button className='btn btn1' onClick={connectAccount}>
        {account ? `Connected: ${account.slice(0, 6)}...` : "Connect Wallet"}
      </button>
    <h1>Task Manager DApp</h1>

    <form>
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
      <button onClick={addTask}>Add Task</button>
    </div>
  </form>

    <div className="todos-list">
      <h2>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 18 20"
          fill="none"
        >
          <path
            d="M15 8L13.59 6.58L7 13.17L4.41 10.59L3 12L7 16L15 8ZM16 2H11.82C11.4 0.84 10.3 0 9 0C7.7 0 6.6 0.84 6.18 2H2C1.86 2 1.73 2.01 1.6 2.04C1.21 2.12 0.86 2.32 0.59 2.59C0.41 2.77 0.26 2.99 0.16 3.23C0.0600001 3.46 0 3.72 0 4V18C0 18.27 0.0600001 18.54 0.16 18.78C0.26 19.02 0.41 19.23 0.59 19.42C0.86 19.69 1.21 19.89 1.6 19.97C1.73 19.99 1.86 20 2 20H16C17.1 20 18 19.1 18 18V4C18 2.9 17.1 2 16 2ZM9 1.75C9.41 1.75 9.75 2.09 9.75 2.5C9.75 2.91 9.41 3.25 9 3.25C8.59 3.25 8.25 2.91 8.25 2.5C8.25 2.09 8.59 1.75 9 1.75ZM16 18H2V4H16V18Z"
            fill="#323232"
          />
        </svg>
        <span> Tasks</span>
      </h2>

      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <h3>{task.taskTitle}</h3>
            <p>{task.taskText}</p>
            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  
  </div>
  
    </>
  )
}

export default App
