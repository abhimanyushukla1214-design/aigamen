import { orchestrateGameDirector } from './src/agents/gameDirector.js';

orchestrateGameDirector('A mysterious exploration game on Europa where the player investigates an abandoned research station.', 'test_req_123').then(res => {
  console.log('Success:', res);
}).catch(err => {
  console.error('Error:', err);
});
