first of all, there need several changes on da artifact

we dont want class system for da services. rather create a single file for each responsibity.
like this /backend/services/credentials/create.ts, /credentials/update.ts etc

also introduce responsitory layer like services too. follow da same folder strategy. for each action create a single file like above. and no class system.

for both layers, wrap the executable code with proper log system and handle the err response

so we will validate & extract validated data in http layer. then pass down the data to services & from services call da repo layer. and make sure success and err response flow back to http layer to client side

and tell me, is there anything more we can do or not for this refactoring in backend side. we will try to follow da same recipe for other resources when we add a new resource
all da http actions will follow this layers data passing rules. even for delete action too
