# Implementation Plan - Online Damta

## Goal
Create a web-based "Online Smoking Break" (Damta) service where users can virtually smoke together, chat, and see real-time statistics.

## User Review Required
- **Tech Stack**: React (Vite) for Frontend, Node.js + Socket.io for Backend.
- **Styling**: Vanilla CSS for a custom, premium dark-mode aesthetic.
- **Real-time**: Socket.io for syncing cigarette status, chat, and user counts.

## Proposed Changes

### Project Structure
- `/online-damta/client`: React Frontend
- `/online-damta/server`: Node.js Backend

### Backend (Server)
- **Dependencies**: `express`, `socket.io`, `cors`
- **Features**:
    - `connection`: Track active user count.
    - `join`: Assign nickname.
    - `smoke_start`: Increment "total smoked today" counter.
    - `chat_message`: Broadcast messages.
    - `npc_chat`: Interval-based bot messages if chat is silent.

### Frontend (Client)
- **Dependencies**: `socket.io-client`
- **Components**:
    - `App.jsx`: Main container, handles socket connection.
    - `Login.jsx`: Simple nickname input.
    - `SmokingRoom.jsx`: The main view.
    - `Cigarette.jsx`: The interactive cigarette element (canvas or CSS based).
    - `ChatOverlay.jsx`: Floating chat messages.
- **Design**:
    - Dark, moody atmosphere (gray/black/ember colors).
    - Smoke animations.

## Verification Plan
### Automated Tests
- None planned for this rapid prototype, will rely on manual verification.

### Manual Verification
- Open multiple browser tabs to simulate multiple users.
- Verify "Current Smokers" count updates.
- Verify Chat messages appear on all screens.
- Verify NPC messages appear after idle time.
- Verify Cigarette burn speed changes on interaction.
