# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|

  # You can search for boxes at https://atlas.hashicorp.com/search.
  config.vm.box = "debian/jessie64"
  config.vm.network "forwarded_port", guest: 4000, host: 4000, auto_correct: true

  config.vm.provision "shell", inline: <<-SHELL
    echo "Checking if LANG has been set for user vagrant"
    if ! grep -q 'export LANG=' "/home/vagrant/.bashrc"; then
      echo "Setting LANG to us UTF8"
      echo 'export LANG=en_US.UTF-8' >> /home/vagrant/.bashrc
    fi
    echo "Checking if LC_ALL has been set for user vagrant"
    if ! grep -q 'export LC_ALL=' "/home/vagrant/.bashrc"; then
      echo "Setting LC_ALL to us UTF8"
      echo 'export LC_ALL=en_US.UTF-8' >> /home/vagrant/.bashrc
    fi

    echo "Setting up curl and nodejs"
    sudo apt-get update -y && sudo apt-get install curl nodejs -y

    echo "Setting up gpg keys for RVM"
    gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
    echo "Getting ruby 2.1.5 from rvm"
    curl -L https://get.rvm.io | bash -s stable --ruby=2.1.5
    source /etc/profile.d/rvm.sh

    echo "Updating gems and installing bundler"
    rvm rubygems latest
    gem install bundler

    echo "Installing Octopress"
    cd /vagrant
    bundle install
  SHELL
end
