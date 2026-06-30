const mongoose = require('mongoose');

const mongoUrl = 'mongodb://127.0.0.1:27017/infotact_workspace';

async function run() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB successfully');

    // Define temporary schemas to execute delete queries
    const WorkspaceSchema = new mongoose.Schema({}, { strict: false, collection: 'workspaces' });
    const ChannelSchema = new mongoose.Schema({}, { strict: false, collection: 'channels' });
    const MessageSchema = new mongoose.Schema({}, { strict: false, collection: 'messages' });

    const Workspace = mongoose.model('WorkspaceTemp', WorkspaceSchema);
    const Channel = mongoose.model('ChannelTemp', ChannelSchema);
    const Message = mongoose.model('MessageTemp', MessageSchema);

    // Find the workspace
    const workspace = await Workspace.findOne({ name: /TechNova/i });

    if (!workspace) {
      console.log('Workspace "TechNova" not found in the database.');
      return;
    }

    console.log(`Found Workspace: ${workspace.name} (ID: ${workspace._id})`);

    // Find all channels for this workspace
    const channels = await Channel.find({ workspaceId: workspace._id });
    const channelIds = channels.map(c => c._id);
    console.log(`Found ${channels.length} channels associated with the workspace.`);

    // Delete messages
    if (channelIds.length > 0) {
      const msgResult = await Message.deleteMany({ channelId: { $in: channelIds } });
      console.log(`Deleted ${msgResult.deletedCount} messages.`);
    }

    // Delete channels
    const chanResult = await Channel.deleteMany({ workspaceId: workspace._id });
    console.log(`Deleted ${chanResult.deletedCount} channels.`);

    // Delete workspace
    await Workspace.deleteOne({ _id: workspace._id });
    console.log('Workspace deleted successfully.');

  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

run();
