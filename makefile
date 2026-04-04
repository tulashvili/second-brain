.PHONY: build deploy save

include .env
export

build:
	npx quartz build --serve

save:
	npx quartz sync --no-pull 

deploy:
	rsync -avz --delete \
	-e "ssh -i $(SSH_KEY)" \
	$(SRC) $(SERVER):$(DEPLOY_PATH)