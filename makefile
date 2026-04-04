.PHONY: build deploy save

include .env
export

build:
	npx quartz build --serve

save:
	npx quartz sync --no-pull 

deploy:
	rsync -avz --delete $(SRC) $(SERVER):$(DEPLOY_PATH)