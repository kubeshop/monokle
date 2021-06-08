import {uuidv4} from "./actionCreators";

test('uuidv4', () => {
  expect(uuidv4().length).toBe(36);
});

